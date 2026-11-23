"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AirportSearchField } from "@/components/onboarding/AirportSearchField";
import type { WritablePostCategory } from "@/lib/mock/community";
import {
  MAX_POST_IMAGES,
  uploadCommunityPostImage,
} from "@/lib/community/post-images";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { formatPlaceDestination } from "@/lib/places/autocomplete";
import { useTrips } from "@/lib/trips/TripProvider";
import type { Trip } from "@/lib/trips/types";
import { parseTripDateRange } from "@/lib/weather/parse-trip-dates";
import { todayIsoDate } from "@/lib/shared/dates";
import { WritePostCategoryChips } from "@/components/community/WritePostCategoryChips";
import { WritePostImageSection } from "@/components/community/WritePostImageSection";
import { WritePostPartyFields } from "@/components/community/WritePostPartyFields";
import { WritePostSheetHeader } from "@/components/community/WritePostSheetHeader";
import type {
  DraftImage,
  WritePostSheetProps,
} from "@/components/community/write-post-sheet.types";
import {
  buildScheduleShareText,
  defaultDate,
  digitsOnly,
} from "@/components/community/write-post-sheet.utils";

export type {
  DraftImage,
  WritePostSheetProps,
} from "@/components/community/write-post-sheet.types";

export function WritePostSheet({
  open,
  onClose,
  onSubmit,
  initialCategory = "party",
  editingPost = null,
}: WritePostSheetProps) {
  const { user, provider } = useAuth();
  const { trips } = useTrips();
  const todayIso = todayIsoDate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditing = Boolean(editingPost);
  const [category, setCategory] = useState<WritablePostCategory>(initialCategory);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [body, setBody] = useState("");
  const [startDate, setStartDate] = useState(defaultDate(14));
  const [endDate, setEndDate] = useState(defaultDate(17));
  const [needed, setNeeded] = useState(4);
  const [budgetPerPerson, setBudgetPerPerson] = useState("");
  const [images, setImages] = useState<DraftImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripPickerOpen, setTripPickerOpen] = useState(false);
  const [sharedTripId, setSharedTripId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (editingPost) {
      setCategory(editingPost.category);
      setTitle(editingPost.title);
      setDestination(editingPost.destination);
      setBody(editingPost.preview);
      setStartDate(editingPost.party?.startDate ?? defaultDate(14));
      setEndDate(editingPost.party?.endDate ?? defaultDate(17));
      setNeeded(editingPost.party?.needed ?? 4);
      setBudgetPerPerson(digitsOnly(editingPost.party?.budgetPerPerson ?? ""));
      setImages(
        (editingPost.images ?? []).map((url) => ({
          id: url,
          previewUrl: url,
          uploadedUrl: url,
        }))
      );
      setSharedTripId(null);
      setTripPickerOpen(false);
      setError(null);
      return;
    }

    setCategory(initialCategory);
    setTitle("");
    setDestination("");
    setBody("");
    setStartDate(defaultDate(14));
    setEndDate(defaultDate(17));
    setNeeded(4);
    setBudgetPerPerson("");
    setImages([]);
    setSharedTripId(null);
    setTripPickerOpen(false);
    setError(null);
  }, [editingPost, initialCategory, open]);

  const isParty = category === "party";
  const shareableTrips = useMemo(
    () => trips.filter((trip) => trip.status !== "completed"),
    [trips]
  );

  const canSubmit = useMemo(() => {
    if (!title.trim() || !destination.trim() || !body.trim()) return false;
    if (isParty && (!startDate || !endDate || needed < 2)) return false;
    return true;
  }, [body, destination, endDate, isParty, needed, startDate, title]);

  if (!open) return null;

  function applySharedTrip(trip: Trip) {
    setDestination(trip.destination);
    const parsed = parseTripDateRange(trip.dateRange, trip.dDay);
    if (parsed) {
      setStartDate(parsed.startDate);
      setEndDate(parsed.endDate);
    }
    if (trip.people >= 2) {
      setNeeded(Math.min(20, Math.max(2, trip.people)));
    }
    if (trip.people > 0 && trip.budget > 0) {
      const perPersonManwon = Math.max(
        1,
        Math.round(trip.budget / trip.people / 10_000)
      );
      setBudgetPerPerson(String(perPersonManwon));
    }
    if (!title.trim()) {
      setTitle(`${trip.destination} 동행 구해요`);
    }
    setBody((prev) => {
      const shareText = buildScheduleShareText(trip);
      if (!prev.trim()) return shareText;
      if (prev.includes(trip.destination) && prev.includes("일정")) return prev;
      return `${prev.trim()}\n\n${shareText}`;
    });
    setSharedTripId(trip.id);
    setTripPickerOpen(false);
    setError(null);
  }

  function handlePickImages(files: FileList | null) {
    if (!files?.length) return;

    const remaining = MAX_POST_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`사진은 최대 ${MAX_POST_IMAGES}장까지 올릴 수 있어요.`);
      return;
    }

    const nextFiles = Array.from(files).slice(0, remaining);
    const nextImages = nextFiles.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    setImages((prev) => [...prev, ...nextImages]);
    setError(null);
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target?.file) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((image) => image.id !== id);
    });
  }

  async function handleSubmit() {
    if (!canSubmit || uploading) {
      setError("필수 항목을 입력해주세요.");
      return;
    }

    const pendingUploads = images.filter((image) => image.file);
    if (pendingUploads.length > 0) {
      if (!user?.id || provider === "guest") {
        setError("사진 업로드는 로그인 후 이용할 수 있어요.");
        return;
      }

      const supabase = getBrowserSupabase();
      if (!supabase) {
        setError("사진 업로드를 위해 Supabase 연결이 필요해요.");
        return;
      }
    }

    setUploading(true);
    setError(null);

    const imageUrls: string[] = [];
    const supabase = getBrowserSupabase();

    for (const image of images) {
      if (image.uploadedUrl) {
        imageUrls.push(image.uploadedUrl);
        continue;
      }

      if (!image.file || !supabase || !user?.id) continue;

      const uploaded = await uploadCommunityPostImage(
        supabase,
        user.id,
        image.file
      );

      if ("error" in uploaded) {
        setError(uploaded.error);
        setUploading(false);
        return;
      }

      imageUrls.push(uploaded.url);
    }

    await onSubmit({
      category,
      title: title.trim(),
      destination: destination.trim(),
      body: body.trim(),
      imageUrls,
      party: isParty
        ? {
            startDate,
            endDate,
            needed,
            current: editingPost?.party?.current ?? 1,
            budgetPerPerson: budgetPerPerson.trim() || undefined,
            members: editingPost?.party?.members ?? [],
          }
        : undefined,
    });

    if (!isEditing) {
      images.forEach((image) => {
        if (image.file) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
      setTitle("");
      setDestination("");
      setBody("");
      setBudgetPerPerson("");
      setImages([]);
      setSharedTripId(null);
      setTripPickerOpen(false);
    }
    setUploading(false);
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[88dvh] w-full max-w-mobile overflow-y-auto rounded-t-[28px] bg-surface-white/95 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 shadow-lg backdrop-blur-xl ring-1 ring-black/5">
        <WritePostSheetHeader isEditing={isEditing} onClose={onClose} />

        <WritePostCategoryChips
          category={category}
          isEditing={isEditing}
          onCategoryChange={setCategory}
        />

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-ink-caption">제목</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isParty ? "예: 도쿄 3박4일 동행 2명 구해요" : "제목을 입력하세요"}
              className="h-11 rounded-lg border border-line-soft px-3 text-sm outline-none focus:border-brand"
            />
          </label>

          <AirportSearchField
            label="여행지"
            placeholder="예: 도쿄, 일본"
            value={destination}
            onChange={setDestination}
            placesMode="cities"
            formatValue={formatPlaceDestination}
            variant="compact"
          />

          {isParty ? (
            <WritePostPartyFields
              todayIso={todayIso}
              startDate={startDate}
              endDate={endDate}
              needed={needed}
              budgetPerPerson={budgetPerPerson}
              tripPickerOpen={tripPickerOpen}
              sharedTripId={sharedTripId}
              shareableTrips={shareableTrips}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onNeededChange={setNeeded}
              onBudgetPerPersonChange={setBudgetPerPerson}
              onToggleTripPicker={() => setTripPickerOpen((prev) => !prev)}
              onApplySharedTrip={applySharedTrip}
            />
          ) : null}

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-ink-caption">내용</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder={
                isParty
                  ? "여행 스타일, 선호 일정, 함께하고 싶은 분의 조건 등을 적어주세요."
                  : "내용을 입력하세요"
              }
              className="resize-none rounded-lg border border-line-soft px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <WritePostImageSection
            fileInputRef={fileInputRef}
            images={images}
            uploading={uploading}
            onPickImages={handlePickImages}
            onRemoveImage={removeImage}
          />
        </div>

        {error ? (
          <p className="mt-3 text-xs text-danger">{error}</p>
        ) : null}

        <PrimaryButton
          className="mt-4"
          disabled={!canSubmit || uploading}
          onClick={() => {
            void handleSubmit();
          }}
        >
          {uploading
            ? "업로드 중..."
            : isEditing
              ? "게시글 수정"
              : "게시글 등록"}
        </PrimaryButton>
      </div>
    </div>
  );
}