"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomCTA } from "@/components/ds/BottomCTA";
import { SettleExplainSheet } from "@/components/ledger/SettleExplainSheet";
import {
  SplitChatRoom,
  toSplitChatMembers,
} from "@/components/ledger/SplitChatRoom";
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
import { SettleStepHeader } from "./SettleStepHeader";
import { SettleStepSummary } from "./SettleStepSummary";

type Props = SettleStepProps;

/**
 * 호스트 ⑤ 정산 단계. 잔액·통화합계·수수료 차이 → 정산표 생성.
 * 송금·공유·이력은 PayStep(U5).
 */
export function SettleStep({
  tripId,
  mode = "page",
  onAdjust,
  onPay,
  onOpenSettings,
  reference: referenceProp,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAnonymous } = useAuth();
  const [members, setMembers] = useState<TripMember[]>([]);
  const [creating, setCreating] = useState(false);
  const chatAnchorRef = useRef<HTMLDivElement>(null);
  const [expenseRows, setExpenseRows] = useState<LedgerExpenseRow[]>([]);
  const [fxFallbackCount, setFxFallbackCount] = useState(0);
  const [expenseLabels, setExpenseLabels] = useState<Record<string, string>>({});
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
    chatAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchParams, loaded]);

  const openAdvanced = useCallback(() => {
    if (onAdjust) {
      onAdjust();
      return;
    }
    router.push(adjustHref);
  }, [adjustHref, onAdjust, router]);

  return (
    <div
      className={
        mode === "page"
          ? "mx-auto flex max-w-mobile flex-col gap-5 px-4 py-6 pb-8"
          : "flex flex-col gap-3 px-4 pt-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
      }
    >
      <SettleStepHeader
        mode={mode}
        tripId={tripId}
        onOpenSettings={onOpenSettings}
      />

      {loadError ? (
        <p
          role="alert"
          className="rounded-mu-lg border border-mu-warn/30 bg-mu-warn-soft px-4 py-3 text-mu-caption font-semibold text-mu-warn"
        >
          정산 정보를 모두 불러오지 못했어요. 새로고침해 주세요.
        </p>
      ) : null}

      {loaded && openSettleSuggestionId && canCreateSettlement ? (
        <div
          role="status"
          className="rounded-mu-xl border border-mu-accent/25 bg-mu-accent-soft px-4 py-3"
        >
          <p className="text-mu-label font-bold text-mu-fg">정산 제안이 있어요</p>
          <p className="mt-1 text-mu-caption text-mu-fg-2">
            아래 버튼으로 확인하면 서버가 원장 기준으로 다시 계산한 뒤
            반영해요. 금액은 화면 미리보기와 다를 수 있어요.
          </p>
        </div>
      ) : null}

      {loaded ? (
        <SettleStepSummary
          me={me}
          myShare={myShare}
          totalKrw={totalKrw}
          others={others}
          balances={balances}
          currencyTotals={currencyTotals}
          expenseRows={expenseRows}
          onExplain={() => setExplainOpen(true)}
        />
      ) : null}

      {loaded ? (
        <div ref={chatAnchorRef} className="-mx-4 flex min-h-[28rem] flex-col">
          <SplitChatRoom
            tripId={tripId}
            members={toSplitChatMembers(members)}
            variant="inline"
            onOpenAdvanced={openAdvanced}
          />
        </div>
      ) : null}

      {stale ? (
        <div
          role="status"
          className="rounded-mu-lg border border-mu-warn/30 bg-mu-warn-soft px-4 py-3 text-mu-caption font-semibold text-mu-warn"
        >
          <p>정산 후 지출이 바뀌었어요. 다시 계산할까요?</p>
          {hasPaid ? (
            <p className="mt-1 font-normal">
              이미 송금 표시된 항목이 있어요. 다시 계산하면 새 정산표가
              만들어져요.
            </p>
          ) : null}
        </div>
      ) : null}

      {!canCreateSettlement && loaded ? (
        <p className="text-mu-caption text-mu-fg-3">
          {isAnonymous
            ? "호스트가 정산을 계산해요. 송금은 송금 단계에서 표시할 수 있어요."
            : "정산표는 여행을 만든 분만 만들 수 있어요. 송금은 송금 단계에서 표시할 수 있어요."}
        </p>
      ) : null}

      {loaded && !settlement && canCreateSettlement ? (
        <p className="text-mu-caption text-mu-fg-3">
          아직 만든 정산표가 없어요. 아래 버튼으로 계산해 보세요.
        </p>
      ) : null}

      {msg ? <p className="text-mu-caption text-mu-fg-3">{msg}</p> : null}

      <SettleExplainSheet
        open={explainOpen}
        onClose={() => setExplainOpen(false)}
        result={explainResult}
        stale={stale}
        tripCurrencies={tripCurrencies}
        reference={reference}
      />

      {canGoPay ? (
        <BottomCTA
          label="송금하러 가기"
          onClick={goPay}
          loading={creating}
          secondary={
            canCreateSettlement
              ? {
                  label: openSettleSuggestionId
                    ? "정산 제안 다시 반영하기"
                    : "정산 다시 계산하기",
                  onClick: () => void createSettlement(),
                }
              : undefined
          }
        />
      ) : canCreateSettlement ? (
        <BottomCTA
          label={
            openSettleSuggestionId
              ? "정산 제안 확인하기"
              : settlement
                ? "정산 다시 계산하기"
                : "정산 계산하기"
          }
          onClick={() => void createSettlement()}
          loading={creating}
          hint={
            openSettleSuggestionId
              ? "에이전트 제안을 확인하면 서버가 다시 계산해요"
              : stale
                ? "지출이 바뀌었어요"
                : undefined
          }
        />
      ) : null}

      {fxFallbackCount > 0 ? (
        <p
          role="alert"
          className="rounded-mu-md border border-mu-warn/30 bg-mu-warn-soft px-3 py-2 text-mu-caption font-semibold text-mu-warn"
        >
          {fxFallbackCount}건은 마지막으로 확인한 환율로 계산됐어요. 송금하기
          전에 금액을 한 번 더 확인해 주세요.
        </p>
      ) : null}
    </div>
  );
}