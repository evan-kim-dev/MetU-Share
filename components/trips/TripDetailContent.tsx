"use client";

import { useCallback, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  buildScheduleRebalancePreview,
  type ScheduleRebalancePreview,
} from "@/lib/budget/trip-rebalance-preview";
import { useLedger } from "@/lib/ledger/useLedger";
import { formatKRW } from "@/lib/shared/format";
import { useTrips } from "@/lib/trips/TripProvider";
import { useRouter } from "next/navigation";
import { MapPin, Trash2, Users } from "lucide-react";
import { useOptionalToast } from "@/components/ds/Toast";
import { MobileShell } from "@/components/layout/MobileShell";
import { TripInfoCard } from "@/components/trips/TripDetailParts";
import { type TripIntent } from "@/components/trips/TripIntentSheet";
import { TripDetailBudgetSection } from "@/components/trips/detail/TripDetailBudgetSection";
import { TripDetailHero } from "@/components/trips/detail/TripDetailHero";
import { TripDetailMemoSection } from "@/components/trips/detail/TripDetailMemoSection";
import { TripDetailScheduleSection } from "@/components/trips/detail/TripDetailScheduleSection";
import { TripDetailTipsSection } from "@/components/trips/detail/TripDetailTipsSection";
import { ScheduleRebalancePreviewSheet } from "@/components/trips/detail/ScheduleRebalancePreviewSheet";
import { TripSummaryPanel } from "@/components/trips/detail/TripSummaryPanel";
import { useTripDetailEditor } from "@/components/trips/useTripDetailEditor";
import type { MapPoint } from "@/lib/map/trip-points";
import { nextScheduleLineFromTrip } from "@/components/trips/trip-detail-content.helpers";
import type {
  DetailTab,
  TripDetailContentProps,
} from "@/components/trips/trip-detail-content.types";
import {
  TripDetailLoadingState,
  TripDetailNotFoundState,
} from "@/components/trips/TripDetailContentStates";
import { TripDetailIntentFab } from "@/components/trips/TripDetailIntentFab";
import { TripDetailNavTabs } from "@/components/trips/TripDetailNavTabs";
import { TripDetailShareButton } from "@/components/trips/TripDetailShareButton";
import { TripDetailStyleSection } from "@/components/trips/TripDetailStyleSection";
import { useTripDetailScheduleScroll } from "@/components/trips/useTripDetailScheduleScroll";

export function TripDetailContent({ tripId }: TripDetailContentProps) {
  const router = useRouter();
  const { user, provider } = useAuth();
  const { updateTrip } = useTrips();
  const toast = useOptionalToast();
  const isGuest = !user || provider === "guest";
  const [detailTab, setDetailTab] = useState<DetailTab>("summary");
  const [rebalancePreview, setRebalancePreview] =
    useState<ScheduleRebalancePreview | null>(null);
  const [rebalanceSheetOpen, setRebalanceSheetOpen] = useState(false);
  const {
    trip,
    isReady,
    remaining,
    usedPercent,
    styleLabels,
    editSection,
    setEditSection,
    isDeleting,
    shareCopied,
    shareError,
    draftBudget,
    setDraftBudget,
    draftMemo,
    setDraftMemo,
    editingDayIndex,
    draftDay,
    openBudgetEdit,
    saveBudget,
    openMemoEdit,
    saveMemo,
    openDayEdit,
    cancelDayEdit,
    updateDraftItem,
    sortDraftDayByTime,
    addDraftItem,
    removeDraftItem,
    saveDayEdit,
    applyScheduleReorder,
    handleDelete,
    handleShareTrip,
    updateTripSchedule,
  } = useTripDetailEditor(tripId);

  // 초대로 합류한 여행(isOwner === false)은 읽기 전용이에요. 지출/송금만 함께 해요.
  const canEdit = trip?.isOwner !== false;

  const ledger = useLedger(tripId, {
    country: trip?.country,
    destination: trip?.destination,
    dailySchedule: trip?.dailySchedule,
    onTotalKrwChange: (totalKrw) => {
      if (trip && trip.isOwner !== false && trip.spent !== totalKrw) {
        void updateTrip(tripId, { spent: totalKrw });
      }
    },
  });

  const [mapHighlightKey, setMapHighlightKey] = useState<string | undefined>();
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderError, setReorderError] = useState("");
  const [intentOpen, setIntentOpen] = useState(false);
  const [botOpen, setBotOpen] = useState(false);
  const scheduleItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scheduleSectionRef = useRef<HTMLDivElement | null>(null);
  const [scheduleScrollNonce, setScheduleScrollNonce] = useState(0);

  const handleTripIntent = useCallback(
    (intent: TripIntent) => {
      if (intent === "schedule") {
        setDetailTab("schedule");
        return;
      }
      if (intent === "expense") {
        router.push(`/trips/${tripId}/ledger?add=manual`);
        return;
      }
      if (intent === "split") {
        router.push(`/trips/${tripId}/ledger?step=adjust`);
        return;
      }
      if (intent === "cash") {
        router.push(`/trips/${tripId}/ledger?add=cash`);
        return;
      }
      if (intent === "bot") {
        setBotOpen(true);
      }
    },
    [router, tripId]
  );

  const handleSelectMapPoint = useCallback((point: MapPoint) => {
    setMapHighlightKey(point.key);
    const el = scheduleItemRefs.current[point.key];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setMapHighlightKey(undefined), 1800);
  }, []);

  const goToScheduleTab = useCallback(() => {
    setDetailTab("schedule");
    // 이미 일정 탭이어도 스크롤을 다시 트리거해요
    setScheduleScrollNonce((n) => n + 1);
  }, []);

  useTripDetailScheduleScroll(detailTab, scheduleScrollNonce, scheduleSectionRef);

  const handleReviewSchedule = useCallback(() => {
    if (!trip) {
      goToScheduleTab();
      return;
    }
    if (!canEdit) {
      goToScheduleTab();
      return;
    }
    const schedule = trip.dailySchedule ?? [];
    if (schedule.length === 0) {
      goToScheduleTab();
      return;
    }
    const preview = buildScheduleRebalancePreview({
      budget: trip.budget,
      spent: trip.spent,
      schedule,
    });
    if (!preview.needsApply) {
      goToScheduleTab();
      return;
    }
    setRebalancePreview(preview);
    setRebalanceSheetOpen(true);
  }, [trip, canEdit, goToScheduleTab]);

  const handleApplyRebalance = useCallback(() => {
    if (!rebalancePreview) return;
    const saved = rebalancePreview.result.savedAmount;
    const next = rebalancePreview.nextSchedule;
    setRebalanceSheetOpen(false);
    setRebalancePreview(null);
    updateTripSchedule(next);
    // 시트 unmount·포커스 복귀 이후 탭 이동·스크롤
    window.setTimeout(() => {
      goToScheduleTab();
      toast?.show({
        text: `일정을 ${formatKRW(saved)} 줄였어요`,
        tone: "ok",
      });
    }, 50);
  }, [rebalancePreview, updateTripSchedule, goToScheduleTab, toast]);

  const handleCloseRebalanceSheet = useCallback(() => {
    setRebalanceSheetOpen(false);
    setRebalancePreview(null);
  }, []);

  if (!isReady) {
    return <TripDetailLoadingState />;
  }

  if (!trip) {
    return <TripDetailNotFoundState />;
  }

  return (
    <MobileShell
      title="여행 상세"
      showBack
      backHref="/trips"
      rightSlot={
        canEdit ? (
          <TripDetailShareButton
            shareCopied={shareCopied}
            onShare={() => {
              void handleShareTrip();
            }}
          />
        ) : undefined
      }
    >
      {shareError ? (
        <p className="px-5 pt-3 text-xs text-red-500">{shareError}</p>
      ) : null}
      <div className="flex flex-col gap-6 px-5 pb-8 pt-5">
        <TripDetailHero trip={trip} />

        <section className="grid grid-cols-2 gap-3">
          <TripInfoCard
            icon={<Users className="h-4 w-4" />}
            label="인원"
            value={`${trip.people}명`}
          />
          <TripInfoCard
            icon={<MapPin className="h-4 w-4" />}
            label="출발지"
            value={trip.origin}
          />
        </section>

        <TripDetailBudgetSection
          trip={trip}
          canEdit={canEdit}
          remaining={remaining}
          usedPercent={usedPercent}
          editing={editSection === "budget"}
          draftBudget={draftBudget}
          setDraftBudget={setDraftBudget}
          onOpenEdit={openBudgetEdit}
          onCancel={() => setEditSection(null)}
          onSave={saveBudget}
          onReviewSchedule={handleReviewSchedule}
        />

        <TripDetailNavTabs
          tripId={tripId}
          detailTab={detailTab}
          setDetailTab={setDetailTab}
          onNavigate={(href) => router.push(href)}
        />

        {detailTab === "summary" ? (
          <TripSummaryPanel
            tripId={tripId}
            nextScheduleLine={nextScheduleLineFromTrip(trip)}
            onOpenSchedule={() => setDetailTab("schedule")}
          />
        ) : null}

        <div ref={scheduleSectionRef}>
          <TripDetailScheduleSection
            trip={trip}
            canEdit={canEdit}
            isGuest={isGuest}
            detailTab={detailTab}
            spendByPlaceId={!isGuest ? ledger.spendByPlaceId : undefined}
            mapHighlightKey={mapHighlightKey}
            onSelectMapPoint={handleSelectMapPoint}
            scheduleItemRefs={scheduleItemRefs}
            reorderMode={reorderMode}
            setReorderMode={setReorderMode}
            reorderError={reorderError}
            setReorderError={setReorderError}
            cancelDayEdit={cancelDayEdit}
            updateTripSchedule={updateTripSchedule}
            applyScheduleReorder={applyScheduleReorder}
            editingDayIndex={editingDayIndex}
            draftDay={draftDay}
            openDayEdit={openDayEdit}
            updateDraftItem={updateDraftItem}
            sortDraftDayByTime={sortDraftDayByTime}
            removeDraftItem={removeDraftItem}
            addDraftItem={addDraftItem}
            saveDayEdit={saveDayEdit}
          />
        </div>

        <TripDetailStyleSection styleLabels={styleLabels} />

        <TripDetailTipsSection tips={trip.tips ?? []} />

        <TripDetailMemoSection
          canEdit={canEdit}
          memo={trip.memo}
          editing={editSection === "memo"}
          draftMemo={draftMemo}
          setDraftMemo={setDraftMemo}
          onOpenEdit={openMemoEdit}
          onCancel={() => setEditSection(null)}
          onSave={saveMemo}
        />

        {canEdit ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-colors active:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.2} />
            {isDeleting ? "삭제 중..." : "여행 삭제하기"}
          </button>
        ) : null}
      </div>

      <ScheduleRebalancePreviewSheet
        open={rebalanceSheetOpen}
        preview={rebalancePreview}
        onClose={handleCloseRebalanceSheet}
        onApply={handleApplyRebalance}
      />

      {canEdit && !isGuest ? (
        <TripDetailIntentFab
          tripId={tripId}
          intentOpen={intentOpen}
          setIntentOpen={setIntentOpen}
          botOpen={botOpen}
          setBotOpen={setBotOpen}
          onSelectIntent={handleTripIntent}
        />
      ) : null}
    </MobileShell>
  );
}