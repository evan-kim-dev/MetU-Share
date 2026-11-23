"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { ExpenseDraftInput } from "@/lib/ledger/draft";
import { appendExifFields, readReceiptExif } from "@/lib/ledger/exif";
import { resizeImageToJpeg } from "@/lib/ledger/image";
import { receiptResponseToDraft } from "@/lib/ledger/receipt-client";
import {
  combineShareText,
  deleteShareInbox,
  isShareTargetSupported,
  purgeExpiredShareInbox,
  readShareInbox,
} from "@/lib/ledger/share-inbox";
import {
  ensureOwnerMember,
  listCardProfiles,
  listMembers,
} from "@/lib/ledger/supabase";
import type { TripMember } from "@/lib/ledger/types";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useTrips } from "@/lib/trips/TripProvider";
import {
  pickPreferredTrip,
  type PendingShare,
} from "@/components/share-target/share-target.utils";

export function useShareTarget() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, provider, isReady: authReady } = useAuth();
  const { trips, isReady: tripsReady } = useTrips();

  const [tripId, setTripId] = useState<string>("");
  const [members, setMembers] = useState<TripMember[]>([]);
  const [profiles, setProfiles] = useState<
    Array<{
      id: string;
      label: string;
      fee_rate: number | null;
      fee_flat_krw: number;
    }>
  >([]);
  const [pending, setPending] = useState<PendingShare | null>(null);
  const [loadError, setLoadError] = useState("");
  const [processError, setProcessError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [queue, setQueue] = useState<ExpenseDraftInput[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const processedRef = useRef<string | null>(null);

  const shareCapable = isShareTargetSupported();
  const activeTrips = useMemo(
    () => trips.filter((t) => t.status !== "completed"),
    [trips]
  );

  useEffect(() => {
    void purgeExpiredShareInbox();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadPayload() {
      setLoadError("");
      const id = searchParams.get("id");
      const textParam = searchParams.get("text");

      if (id) {
        const payload = await readShareInbox(id);
        if (cancelled) return;
        if (!payload) {
          setLoadError("공유 내용을 찾지 못했어요. 다시 공유해 주세요.");
          router.replace("/share-target");
          return;
        }
        setPending({
          inboxId: id,
          text: combineShareText(payload.meta),
          file: payload.file,
        });
        return;
      }

      if (textParam?.trim()) {
        setPending({
          text: textParam.trim().slice(0, 2000),
          file: null,
        });
        router.replace("/share-target");
      }
    }
    void loadPayload();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  useEffect(() => {
    if (!tripsReady || activeTrips.length === 0) return;
    if (tripId && activeTrips.some((t) => t.id === tripId)) return;
    const preferred = pickPreferredTrip(trips);
    if (preferred) setTripId(preferred.id);
  }, [tripsReady, trips, activeTrips, tripId]);

  const loadLedger = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase || !user || provider === "guest" || !tripId) return;
    let m = await listMembers(supabase, tripId);
    if (m.length === 0) {
      await ensureOwnerMember(
        supabase,
        tripId,
        user.id,
        user.user_metadata?.name?.trim() ||
          user.user_metadata?.nickname?.trim() ||
          "나"
      );
      m = await listMembers(supabase, tripId);
    }
    const p = await listCardProfiles(supabase);
    setMembers(m);
    setProfiles(p as typeof profiles);
  }, [tripId, user, provider]);

  useEffect(() => {
    void loadLedger();
  }, [loadLedger]);

  const cleanupPending = useCallback(async (inboxId?: string) => {
    if (inboxId) await deleteShareInbox(inboxId);
    setPending(null);
    processedRef.current = null;
  }, []);

  useEffect(() => {
    const share = pending;
    if (!share || !authReady) return;
    if (!user || provider === "guest") return;

    const shareInboxId = share.inboxId;
    const shareText = share.text;
    const shareFile = share.file;

    // Images still need a trip (receipt flow). Text can go unassigned.
    if (shareFile && !tripId) return;
    if (shareFile && members.length === 0) return;
    if (!shareFile && !shareText.trim()) return;

    const key = `${shareInboxId ?? "text"}:${shareText}:${shareFile?.name ?? ""}:${tripId || "none"}`;
    if (processedRef.current === key) return;
    processedRef.current = key;

    let cancelled = false;

    async function run() {
      setProcessing(true);
      setProcessError("");
      try {
        if (shareFile && tripId) {
          const exif = await readReceiptExif(shareFile);
          let resized: File;
          try {
            resized = await resizeImageToJpeg(shareFile);
          } catch {
            resized = shareFile;
          }
          const fd = new FormData();
          fd.set("tripId", tripId);
          fd.set("image", resized);
          appendExifFields(fd, exif);
          const res = await fetch("/api/ledger/receipt", {
            method: "POST",
            body: fd,
          });
          if (cancelled) return;
          if (!res.ok) {
            setProcessError(
              res.status === 401
                ? "로그인이 필요해요."
                : "영수증 인식에 실패했어요."
            );
            processedRef.current = null;
            return;
          }
          const data = (await res.json()) as Parameters<
            typeof receiptResponseToDraft
          >[0];
          const mapped = receiptResponseToDraft(data);
          if (!mapped.ok) {
            setProcessError("영수증이 아닌 것 같아요.");
            processedRef.current = null;
            return;
          }
          setQueue([mapped.draft]);
          setQueueIndex(0);
        } else if (shareText.trim() && tripId) {
          const res = await fetch("/api/ledger/parse-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tripId,
              text: shareText.trim(),
              source: "push",
            }),
          });
          if (cancelled) return;
          if (!res.ok) {
            setProcessError(
              res.status === 401
                ? "로그인이 필요해요."
                : "텍스트 분석에 실패했어요."
            );
            processedRef.current = null;
            return;
          }
          const data = (await res.json()) as { drafts?: ExpenseDraftInput[] };
          const drafts = (data.drafts ?? []).filter((d) => d.kind !== "cancel");
          if (!drafts.length) {
            setProcessError("지출로 읽을 내용이 없어요.");
            processedRef.current = null;
            return;
          }
          setQueue(drafts);
          setQueueIndex(0);
        } else if (shareText.trim()) {
          const res = await fetch("/api/agent/ingest-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: shareText.trim(),
              tripId: null,
            }),
          });
          if (cancelled) return;
          if (!res.ok) {
            setProcessError(
              res.status === 401
                ? "로그인이 필요해요."
                : "미할당 저장에 실패했어요."
            );
            processedRef.current = null;
            return;
          }
          setProcessError("");
          router.push("/agent/inbox");
        }
        await cleanupPending(shareInboxId);
      } catch {
        if (!cancelled) {
          setProcessError("처리 중 오류가 났어요.");
          processedRef.current = null;
        }
      } finally {
        if (!cancelled) setProcessing(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    pending,
    tripId,
    authReady,
    user,
    provider,
    members.length,
    cleanupPending,
    router,
  ]);

  function openDrafts(drafts: ExpenseDraftInput[]) {
    setQueue(drafts);
    setQueueIndex(0);
  }

  return {
    router,
    searchParams,
    user,
    provider,
    authReady,
    tripsReady,
    tripId,
    setTripId,
    members,
    profiles,
    pending,
    loadError,
    processError,
    processing,
    queue,
    setQueue,
    queueIndex,
    setQueueIndex,
    shareCapable,
    activeTrips,
    openDrafts,
  };
}
