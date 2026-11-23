"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettleReference } from "@/components/ledger/useSettleReference";
import { useAuth } from "@/lib/auth/AuthProvider";
import { explainSettlement } from "@/lib/ledger/explain";
import { resolveMyShare } from "@/lib/ledger/my-share";
import {
  basisHash,
  computeBalances,
  minimizeTransfers,
  type LedgerExpense,
} from "@/lib/ledger/settle";
import { totalsByCurrency } from "@/lib/ledger/stats";
import {
  fetchLatestSettlement,
  listExpenses,
  listMembers,
  listVoidedExpenseIds,
  type SettlementSnapshot,
} from "@/lib/ledger/supabase";
import type { LedgerExpenseRow, TripMember } from "@/lib/ledger/types";
import { TABLES } from "@/lib/constants";
import { getBrowserSupabase } from "@/lib/supabase/browser";

import type { SettleStepProps } from "./settle-step-types";
import { toSettleExpense } from "./settle-step-utils";

type Args = Pick<
  SettleStepProps,
  "tripId" | "onAdjust" | "onPay" | "reference"
>;

/**
 * SettleStep 상태·로드·정산표 생성. 금액 계산은 settle 순수 함수만 써요.
 */
export function useSettleStep({
  tripId,
  onAdjust,
  onPay,
  reference: referenceProp,
}: Args) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAnonymous } = useAuth();
  const [members, setMembers] = useState<TripMember[]>([]);
  const [creating, setCreating] = useState(false);
  const chatAnchorRef = useRef<HTMLDivElement>(null);
  const [expenseRows, setExpenseRows] = useState<LedgerExpenseRow[]>([]);
  const [fxFallbackCount, setFxFallbackCount] = useState(0);
  const [expenseLabels, setExpenseLabels] = useState<Record<string, string>>(
    {}
  );
  const [tripCurrencies, setTripCurrencies] = useState<string[]>([]);
  const [explainOpen, setExplainOpen] = useState(false);
  const [settlement, setSettlement] = useState<SettlementSnapshot | null>(null);
  const [basisState, setBasisState] = useState<{
    source: LedgerExpense[];
    hash: string;
  } | null>(null);
  const [msg, setMsg] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  /** 에이전트가 남긴 open settle Suggestion */
  const [openSettleSuggestionId, setOpenSettleSuggestionId] = useState<
    string | null
  >(null);

  const localReference = useSettleReference();
  const reference = referenceProp ?? localReference;

  const expenses = useMemo(
    () => expenseRows.map(toSettleExpense),
    [expenseRows]
  );

  const loadSettlement = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const res = await fetchLatestSettlement(supabase, tripId);
    if (!res.ok) {
      setLoadError(true);
      return;
    }
    setSettlement(res.settlement);

    if (typeof supabase.from === "function") {
      const { data: sug } = await supabase
        .from(TABLES.tripSuggestions)
        .select("id")
        .eq("trip_id", tripId)
        .eq("type", "settle")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setOpenSettleSuggestionId(sug?.id ? String(sug.id) : null);
    } else {
      setOpenSettleSuggestionId(null);
    }
  }, [tripId]);

  const reload = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const [m, e, voided] = await Promise.all([
      listMembers(supabase, tripId),
      listExpenses(supabase, tripId),
      listVoidedExpenseIds(supabase, tripId),
    ]);
    if (voided === null) setLoadError(true);
    const active = e.filter((row) => !voided?.has(row.id));
    setMembers(m);
    setExpenseRows(active);
    setFxFallbackCount(active.filter((row) => row.fxIsFallback).length);
    setExpenseLabels(
      Object.fromEntries(
        active.map((row) => [row.id, row.merchant || row.label || ""])
      )
    );
    setTripCurrencies(
      [
        ...new Set(
          active
            .map((row) => (row.currency || "KRW").trim().toUpperCase())
            .filter((c) => c && c !== "KRW")
        ),
      ].sort()
    );
    await loadSettlement();
    setLoaded(true);
  }, [tripId, loadSettlement]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    void basisHash(expenses).then((hash) => {
      if (!cancelled) setBasisState({ source: expenses, hash });
    });
    return () => {
      cancelled = true;
    };
  }, [expenses]);

  const balances = useMemo(
    () =>
      computeBalances(
        members.map((m) => m.id),
        expenses
      ),
    [members, expenses]
  );

  const currencyTotals = useMemo(
    () => totalsByCurrency(expenseRows),
    [expenseRows]
  );

  const me = useMemo(
    () =>
      user ? members.find((m) => m.userId && m.userId === user.id) : undefined,
    [members, user]
  );

  const basis =
    loaded && basisState && basisState.source === expenses
      ? basisState.hash
      : "";
  const transfers = useMemo(() => settlement?.transfers ?? [], [settlement]);

  const stale = Boolean(
    settlement &&
      (settlement.status === "stale" ||
        (basis && basis !== settlement.basisHash))
  );
  const hasPaid = transfers.some((t) => t.status === "paid");

  const explainResult = useMemo(
    () =>
      explainSettlement({
        members: members.map((m) => ({ id: m.id, name: m.displayName })),
        expenses: expenses.map((e) => ({
          id: e.id,
          label: expenseLabels[e.id] ?? "",
          paidBy: e.paidBy,
          krwAmount: e.krwAmount,
          shares: e.shares,
        })),
        transfers: stale
          ? []
          : transfers.map((t) => ({ from: t.from, to: t.to, krw: t.krw })),
      }),
    [members, expenses, expenseLabels, transfers, stale]
  );

  const payHref = `/trips/${tripId}/ledger?step=pay`;

  function goPay() {
    if (onPay) {
      onPay();
      return;
    }
    router.push(payHref);
  }

  async function acceptSettleSuggestion() {
    if (!user || creating || !openSettleSuggestionId) return;
    setCreating(true);
    setMsg("");
    try {
      const res = await fetch(
        `/api/trips/${tripId}/suggestions/${openSettleSuggestionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision: "accepted" }),
        }
      );
      if (!res.ok) {
        console.error("[acceptSettleSuggestion]", await res.text());
        setMsg("정산 제안 반영에 실패했어요.");
        return;
      }
      setMsg("정산 제안을 반영했어요.");
      setOpenSettleSuggestionId(null);
      await loadSettlement();
      goPay();
    } finally {
      setCreating(false);
    }
  }

  async function createSettlement() {
    const supabase = getBrowserSupabase();
    if (!supabase || !user || creating) return;
    // 열린 settle Suggestion 이 있으면 서버 재계산 수락 경로를 우선해요.
    if (openSettleSuggestionId) {
      await acceptSettleSuggestion();
      return;
    }
    setCreating(true);
    setMsg("");
    try {
      const hash = await basisHash(expenses);
      const transfersCalc = minimizeTransfers(balances);
      const { data, error } = await supabase.rpc("create_settlement", {
        p_trip_id: tripId,
        p_basis_hash: hash,
        p_transfers: transfersCalc.map((t) => ({
          from: t.from,
          to: t.to,
          krw: t.krw,
        })),
      });
      if (error || !data) {
        if (error) console.error("[create_settlement]", error.message);
        setMsg("정산 생성 실패 (소유자만 가능)");
        return;
      }
      setMsg("정산을 만들었어요.");
      await loadSettlement();
      goPay();
    } finally {
      setCreating(false);
    }
  }

  const isOwner = Boolean(me?.isOwner);
  const canCreateSettlement = isOwner && !isAnonymous;
  const totalKrw = expenses.reduce((s, e) => s + e.krwAmount, 0);
  const myBalance = me ? (balances[me.id] ?? 0) : null;
  const myShare = resolveMyShare({
    liveBalance: myBalance,
    hasSettlement: Boolean(settlement),
    stale,
  });
  /** 내 몫은 위 히어로에 있으므로 목록에서는 제외해요. */
  const others = useMemo(
    () => members.filter((m) => m.id !== me?.id),
    [members, me?.id]
  );

  /** 정산표가 있고 최신이면 송금 단계로 갈 수 있어요(송금 0건·completed 포함). */
  const canGoPay = Boolean(settlement) && !stale;

  const adjustHref = `/trips/${tripId}/ledger?step=adjust`;

  useEffect(() => {
    if (searchParams.get("splitChat") !== "1") return;
    chatAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [searchParams, loaded]);

  const openAdvanced = useCallback(() => {
    if (onAdjust) {
      onAdjust();
      return;
    }
    router.push(adjustHref);
  }, [adjustHref, onAdjust, router]);

  return {
    members,
    creating,
    chatAnchorRef,
    expenseRows,
    fxFallbackCount,
    tripCurrencies,
    explainOpen,
    setExplainOpen,
    settlement,
    msg,
    loadError,
    loaded,
    openSettleSuggestionId,
    reference,
    balances,
    currencyTotals,
    me,
    stale,
    hasPaid,
    explainResult,
    isAnonymous,
    canCreateSettlement,
    totalKrw,
    myShare,
    others,
    canGoPay,
    goPay,
    createSettlement,
    openAdvanced,
  };
}
