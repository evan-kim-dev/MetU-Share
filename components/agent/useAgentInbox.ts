"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  autoItems,
  canEditDraft,
  looksLikeJwtExpired,
  mergedItems,
  reviewItems,
} from "@/components/agent/agent-inbox-helpers";
import type {
  AgentEventRow,
  AgentInboxProps,
  BulkAttachState,
  Suggestion,
} from "@/components/agent/agent-inbox-types";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  buildTripSuggest,
  matchTripForEvent,
  resolveTripDatesForReceivedAt,
} from "@/lib/onboarding/trip-match";
import { parseReceivedAtMs } from "@/lib/onboarding/trip-window";
import { toUserFacingError } from "@/lib/errors/user-message";
import { useAutomationStatus } from "@/lib/hooks/useAutomationStatus";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useTrips } from "@/lib/trips/TripProvider";

export type AgentInboxGroups = {
  processing: AgentEventRow[];
  autoDone: AgentEventRow[];
  review: AgentEventRow[];
  failed: AgentEventRow[];
  ignored: AgentEventRow[];
  doneQuiet: AgentEventRow[];
  unassigned: AgentEventRow[];
  unassignedCards: AgentEventRow[];
  scoped: AgentEventRow[];
};

export type BulkGroup = {
  tripId: string;
  name: string;
  ids: string[];
};

export function useAgentInbox({
  tripId,
  trips: tripsProp,
}: Pick<AgentInboxProps, "tripId" | "trips">) {
  const { user, provider, isReady: authReady, isLoggedIn } = useAuth();
  const isGuest = provider === "guest" || !user;
  const { activeTrips, trips: allTrips } = useTrips();
  const trips = useMemo(
    () =>
      tripsProp ??
      activeTrips.map((t) => ({
        id: t.id,
        // 초대로 합류한 여행은 "공유받음"으로 구분해 보여줘요.
        label: `${t.destination} · ${t.dateRange}${
          t.isOwner === false ? " · 공유받음" : ""
        }`,
      })),
    [tripsProp, activeTrips]
  );
  const automationEnabled = authReady && isLoggedIn && !isGuest;
  const { uiState } = useAutomationStatus({
    enabled: automationEnabled,
    lite: true,
  });

  const [events, setEvents] = useState<AgentEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offlineHint, setOfflineHint] = useState(false);
  const [reloadBusy, setReloadBusy] = useState(false);
  const [ignoredOpen, setIgnoredOpen] = useState(false);
  const [filterUnassigned, setFilterUnassigned] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<AgentEventRow | null>(null);
  const [editText, setEditText] = useState("");
  const [editMerchant, setEditMerchant] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCurrency, setEditCurrency] = useState("KRW");
  const [editSpentOn, setEditSpentOn] = useState("");
  const [bulk, setBulk] = useState<BulkAttachState | null>(null);

  const load = useCallback(async () => {
    if (isGuest) {
      setLoading(false);
      setError("");
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase || !user) {
      setLoading(false);
      setError("");
      return;
    }
    setError("");
    setOfflineHint(false);
    let q = supabase
      .from("agent_events")
      .select(
        "id, trip_id, source, kind, status, payload, result, error, created_at, processed_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(80);

    if (tripId) {
      q = q.eq("trip_id", tripId);
    }

    try {
      const { data, error: qErr } = await q;
      if (qErr) {
        const offline =
          typeof navigator !== "undefined" && navigator.onLine === false;
        if (offline) {
          setOfflineHint(true);
          setError("");
          setLoading(false);
          return;
        }
        const mapped = toUserFacingError({
          source: looksLikeJwtExpired(qErr.message) ? "api" : "unknown",
          status: looksLikeJwtExpired(qErr.message) ? 401 : undefined,
          message: qErr.message,
        });
        if (mapped.code === "session-expired" && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("metu:session-expired"));
        }
        if (mapped.code === "network") {
          setOfflineHint(true);
          setError("");
        } else {
          setError("알림을 불러오지 못했어요.");
        }
        setLoading(false);
        return;
      }
      setEvents((data ?? []) as AgentEventRow[]);
      setLoading(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const mapped = toUserFacingError({
        source: "network",
        message,
      });
      if (mapped.code === "network") {
        setOfflineHint(true);
        setError("");
      } else {
        setError("알림을 불러오지 못했어요.");
      }
      setLoading(false);
    }
  }, [tripId, user, isGuest]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (isGuest) return;
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    const filter = tripId
      ? `trip_id=eq.${tripId}`
      : `user_id=eq.${user.id}`;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const channel = supabase
      .channel(`agent_inbox:${tripId ?? "user"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_events",
          filter,
        },
        () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            void load();
          }, 600);
        }
      )
      .subscribe();
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      void supabase.removeChannel(channel);
    };
  }, [tripId, user, load, isGuest]);

  const groups = useMemo((): AgentInboxGroups => {
    const scoped = filterUnassigned
      ? events.filter((e) => e.status === "unassigned" || e.trip_id == null)
      : events;
    const unassigned = events.filter(
      (e) =>
        e.status === "unassigned" ||
        (e.trip_id == null && e.status !== "ignored")
    );
    const processing = scoped.filter((e) =>
      ["received", "processing"].includes(e.status)
    );
    const autoDone = scoped.filter(
      (e) =>
        e.status === "done" &&
        (autoItems(e).length > 0 || mergedItems(e).length > 0)
    );
    const review = scoped.filter((e) => e.status === "needs_review");
    const failed = scoped.filter((e) => e.status === "failed");
    const ignored = scoped.filter((e) => e.status === "ignored");
    const doneQuiet = scoped.filter(
      (e) =>
        e.status === "done" &&
        autoItems(e).length === 0 &&
        mergedItems(e).length === 0
    );
    const unassignedCards = scoped.filter((e) => e.status === "unassigned");
    return {
      processing,
      autoDone,
      review,
      failed,
      ignored,
      doneQuiet,
      unassigned,
      unassignedCards,
      scoped,
    };
  }, [events, filterUnassigned]);

  // 미배정 알림마다 "어느 여행에 붙일까" 제안을 현재 여행 목록으로 계산한다
  // (서버 매처와 같은 순수 함수). 계산이 안 되면 서버가 저장한 제안을 쓴다.
  const suggestions = useMemo(() => {
    const out: Record<string, Suggestion | null> = {};
    const tripIds = new Set(trips.map((t) => t.id));
    for (const e of events) {
      if (e.status !== "unassigned") continue;
      const receivedAtMs = parseReceivedAtMs(e.payload, e.created_at);
      const candidates = activeTrips.map((t) => {
        const dates = resolveTripDatesForReceivedAt(
          {
            startDate: t.startDate,
            endDate: t.endDate,
            dateRange: t.dateRange,
          },
          receivedAtMs
        );
        return {
          id: t.id,
          startDate: dates?.startDate ?? null,
          endDate: dates?.endDate ?? null,
          destination: t.destination,
          status: t.status,
        };
      });
      const match = matchTripForEvent({
        receivedAtMs,
        nowMs: Date.now(),
        candidates,
      });
      const computed = buildTripSuggest(match, candidates);
      const stored = e.result?.suggest;
      out[e.id] =
        computed ??
        (stored && tripIds.has(stored.tripId) ? stored : null);
    }
    return out;
  }, [events, activeTrips, trips]);

  // 같은 여행으로 붙일 미배정이 2건 이상이면 한 번에 붙이기를 제안한다.
  const bulkGroups = useMemo((): BulkGroup[] => {
    const byTrip = new Map<string, { name: string; ids: string[] }>();
    for (const e of groups.unassignedCards) {
      const s = suggestions[e.id];
      if (!s) continue;
      const name =
        s.destination?.trim() ||
        activeTrips.find((t) => t.id === s.tripId)?.destination ||
        "이 여행";
      const g = byTrip.get(s.tripId) ?? { name, ids: [] };
      g.ids.push(e.id);
      byTrip.set(s.tripId, g);
    }
    return [...byTrip.entries()]
      .filter(([, g]) => g.ids.length >= 2)
      .map(([id, g]) => ({ tripId: id, ...g }));
  }, [groups.unassignedCards, suggestions, activeTrips]);

  async function attachAll(targetTripId: string, ids: string[]) {
    if (bulk?.running) return;
    let failed = 0;
    setBulk({
      tripId: targetTripId,
      done: 0,
      total: ids.length,
      failed: 0,
      running: true,
    });
    for (let i = 0; i < ids.length; i++) {
      try {
        await post(`/api/agent/events/${ids[i]}/assign`, {
          tripId: targetTripId,
        });
      } catch {
        failed += 1;
      }
      setBulk({
        tripId: targetTripId,
        done: i + 1,
        total: ids.length,
        failed,
        running: i + 1 < ids.length,
      });
    }
    await load();
  }

  async function post(path: string, body?: unknown) {
    const res = await fetch(path, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    if (!res.ok) throw new Error(json.error ?? "request-failed");
  }

  function openEdit(event: AgentEventRow) {
    const review = reviewItems(event)[0];
    setEditEvent(event);
    setEditText(
      typeof event.payload?.text === "string" ? event.payload.text : ""
    );
    setEditMerchant(review?.draft?.merchant ?? "");
    setEditAmount(
      review?.draft?.amount != null ? String(review.draft.amount) : ""
    );
    setEditCurrency(
      (review?.draft?.currency ?? "KRW").toString().toUpperCase() || "KRW"
    );
    const spent =
      typeof review?.draft?.spentOn === "string" ? review.draft.spentOn : "";
    setEditSpentOn(/^\d{4}-\d{2}-\d{2}$/.test(spent) ? spent : "");
  }

  async function saveEdit() {
    if (!editEvent) return;
    const body: {
      text?: string;
      draft?: {
        merchant?: string;
        amount?: number;
        currency?: string;
        spentOn?: string;
      };
    } = {};
    if (editText.trim()) body.text = editText.trim();
    if (canEditDraft(editEvent.status)) {
      const draft: NonNullable<(typeof body)["draft"]> = {};
      if (editMerchant.trim()) draft.merchant = editMerchant.trim();
      const amt = Number(editAmount.replace(/,/g, ""));
      if (Number.isFinite(amt) && amt > 0) draft.amount = amt;
      if (editCurrency.trim().length === 3) {
        draft.currency = editCurrency.trim().toUpperCase();
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(editSpentOn.trim())) {
        draft.spentOn = editSpentOn.trim();
      }
      if (Object.keys(draft).length > 0) body.draft = draft;
    }
    if (!body.text && !body.draft) return;
    await withBusy(editEvent.id, () =>
      post(`/api/agent/events/${editEvent.id}/edit`, body)
    );
    setEditEvent(null);
  }

  async function withBusy(id: string, fn: () => Promise<void>) {
    setBusyId(id);
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    try {
      await fn();
      await load();
    } catch {
      setRowErrors((prev) => ({
        ...prev,
        [id]: "요청에 실패했어요. 다시 시도해 주세요.",
      }));
    } finally {
      setBusyId(null);
    }
  }

  function onTripCreated() {
    void load();
    window.setTimeout(() => {
      void load();
    }, 1500);
  }

  function reload() {
    setReloadBusy(true);
    void load().finally(() => setReloadBusy(false));
  }

  const connectHref = tripId
    ? `/trips/${tripId}/ledger/connect`
    : "/onboarding/automation";
  const backHref = tripId ? `/trips/${tripId}/ledger` : "/trips";
  const connected = uiState === "ok" || uiState === "silent";
  const unassignedCount = groups.unassigned.length;
  const noTrips = allTrips.length === 0 && trips.length === 0;

  return {
    isGuest,
    trips,
    activeTrips,
    loading,
    error,
    offlineHint,
    events,
    reloadBusy,
    ignoredOpen,
    setIgnoredOpen,
    filterUnassigned,
    setFilterUnassigned,
    busyId,
    rowErrors,
    sheetOpen,
    setSheetOpen,
    editEvent,
    setEditEvent,
    editText,
    setEditText,
    editMerchant,
    setEditMerchant,
    editAmount,
    setEditAmount,
    editCurrency,
    setEditCurrency,
    editSpentOn,
    setEditSpentOn,
    bulk,
    groups,
    suggestions,
    bulkGroups,
    load,
    attachAll,
    post,
    openEdit,
    saveEdit,
    withBusy,
    onTripCreated,
    reload,
    connectHref,
    backHref,
    connected,
    unassignedCount,
    noTrips,
  };
}
