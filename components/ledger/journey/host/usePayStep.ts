"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettleReference } from "@/components/ledger/useSettleReference";
import { useClipboardCopy } from "@/components/onboarding/connect/useClipboardCopy";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  PAY_OPEN_FAILED_MESSAGE,
  launchPayApp,
  payAmountText,
  payGuidance,
  type PayApp,
} from "@/lib/ledger/pay-links";
import {
  basisHash,
  computeBalances,
  type LedgerExpense,
} from "@/lib/ledger/settle";
import {
  buildShareText,
  shareReasonMessage,
} from "@/lib/ledger/settle-share";
import {
  fetchLatestSettlement,
  fetchSettlementHistory,
  listExpenses,
  listMembers,
  listVoidedExpenseIds,
  type SettlementHistoryItem,
  type SettlementSnapshot,
} from "@/lib/ledger/supabase";
import type { TripMember } from "@/lib/ledger/types";
import { formatKRW } from "@/lib/shared/format";
import { getBrowserSupabase } from "@/lib/supabase/browser";

import type { PayStepProps } from "./pay-step-types";

type Args = Pick<
  PayStepProps,
  "tripId" | "audience" | "reference"
>;

/**
 * PayStep 상태·로드·공유·송금 앱 열기. 금액 계산은 하지 않아요.
 */
export function usePayStep({
  tripId,
  audience = "host",
  reference: referenceProp,
}: Args) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TripMember[]>([]);
  const [expenses, setExpenses] = useState<LedgerExpense[]>([]);
  const [fxFallbackCount, setFxFallbackCount] = useState(0);
  const [settlement, setSettlement] = useState<SettlementSnapshot | null>(null);
  const [history, setHistory] = useState<SettlementHistoryItem[]>([]);
  const [basisState, setBasisState] = useState<{
    source: LedgerExpense[];
    hash: string;
  } | null>(null);
  const [msg, setMsg] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [payNote, setPayNote] = useState("");
  const [origin, setOrigin] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const textCopy = useClipboardCopy();
  const linkCopy = useClipboardCopy();
  const amountCopy = useClipboardCopy();
  const payCleanup = useRef<(() => void) | null>(null);
  const localReference = useSettleReference();
  const reference = referenceProp ?? localReference;

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanNativeShare(typeof navigator.share === "function");
    return () => payCleanup.current?.();
  }, []);

  const loadSettlement = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const res = await fetchLatestSettlement(supabase, tripId);
    if (!res.ok) {
      setLoadError(true);
      return;
    }
    setSettlement(res.settlement);
    const past = await fetchSettlementHistory(supabase, tripId);
    if (past) setHistory(past);
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
    setExpenses(
      active.map((row) => ({
        id: row.id,
        paidBy: row.paidBy,
        krwAmount: row.krwAmount,
        shares: row.shares,
      }))
    );
    setFxFallbackCount(active.filter((row) => row.fxIsFallback).length);
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

  const names = useMemo(
    () => Object.fromEntries(members.map((m) => [m.id, m.displayName])),
    [members]
  );
  const nameOf = (id: string) => names[id] ?? "?";

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
  const status = settlement?.status ?? "";
  const sharePath = settlement?.shareToken ? `/s/${settlement.shareToken}` : "";
  const shareUrl = sharePath && origin ? `${origin}${sharePath}` : "";

  const stale = Boolean(
    settlement &&
      (settlement.status === "stale" ||
        (basis && basis !== settlement.basisHash))
  );
  const allPaid =
    transfers.length > 0 && transfers.every((t) => t.status === "paid");
  const completed = status === "completed" || allPaid;
  const paidCount = transfers.filter((t) => t.status === "paid").length;
  const isOwner = Boolean(me?.isOwner);
  const myOutgoing = transfers.filter((t) => me && t.from === me.id);
  const myOutgoingUnpaid = myOutgoing.filter((t) => t.status !== "paid");
  const myOutgoingDone =
    myOutgoing.length > 0 && myOutgoingUnpaid.length === 0;
  const visibleTransfers =
    audience === "guest" && me
      ? transfers.filter((t) => t.from === me.id || t.to === me.id)
      : transfers;

  const shareResult = useMemo(() => {
    if (!settlement || transfers.length === 0) return null;
    return buildShareText({
      names,
      transfers,
      balances,
      shareUrl: shareUrl || null,
      fxFallbackCount,
      conversion: reference.shareConversion,
    });
  }, [
    settlement,
    transfers,
    names,
    balances,
    shareUrl,
    fxFallbackCount,
    reference.shareConversion,
  ]);

  const shareText = !stale && shareResult?.ok ? shareResult.text : null;
  const shareBlockedMessage = stale
    ? "지출이 바뀌어서 공유 문구를 만들 수 없어요. 정산을 다시 계산해 주세요."
    : shareResult && !shareResult.ok
      ? shareReasonMessage(shareResult.reason)
      : "";

  async function markPaid(transferId: string) {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const { error } = await supabase.rpc("mark_transfer_paid", {
      p_transfer_id: transferId,
    });
    if (error) {
      console.error("[mark_transfer_paid]", error.message);
      setMsg("완료 처리 실패");
      return;
    }
    setMsg("");
    await loadSettlement();
  }

  async function copyShareText() {
    if (!shareText) return;
    await textCopy.copy(shareText);
  }

  async function copyShareLink() {
    if (!shareUrl) return;
    await linkCopy.copy(shareUrl);
  }

  async function nativeShare() {
    if (!shareText || typeof navigator.share !== "function") return;
    try {
      await navigator.share({
        title: "정산 안내",
        text: shareText,
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      console.error("[navigator.share]", e instanceof Error ? e.message : e);
      setMsg("공유하지 못했어요. 복사해서 보내 주세요.");
    }
  }

  function openPayApp(app: PayApp, krw: number) {
    const amount = payAmountText(krw);
    if (!amount) {
      setMsg("금액을 확인할 수 없어요.");
      return;
    }
    void amountCopy.copy(amount).then((ok) => {
      setPayNote((prev) =>
        prev === PAY_OPEN_FAILED_MESSAGE
          ? prev
          : ok
            ? payGuidance(app.label, formatKRW(krw))
            : `금액을 복사하지 못했어요. ${formatKRW(krw)}을 직접 입력해 주세요.`
      );
    });
    setPayNote(payGuidance(app.label, formatKRW(krw)));
    payCleanup.current?.();
    payCleanup.current = launchPayApp(app.id, {
      onFallback: () => setPayNote(PAY_OPEN_FAILED_MESSAGE),
    });
  }

  const settleHref = `/trips/${tripId}/ledger?step=settle`;
  const recapHref = `/trips/${tripId}/ledger/recap`;
  const myOutgoingPaid = myOutgoing.filter((t) => t.status === "paid").length;

  return {
    settlement,
    history,
    loaded,
    loadError,
    msg,
    setMsg,
    payNote,
    origin,
    canNativeShare,
    historyOpen,
    setHistoryOpen,
    textCopy,
    linkCopy,
    amountCopy,
    nameOf,
    me,
    transfers,
    sharePath,
    shareUrl,
    stale,
    completed,
    paidCount,
    isOwner,
    myOutgoing,
    myOutgoingUnpaid,
    myOutgoingDone,
    myOutgoingPaid,
    visibleTransfers,
    shareText,
    shareBlockedMessage,
    settleHref,
    recapHref,
    markPaid,
    copyShareText,
    copyShareLink,
    nativeShare,
    openPayApp,
  };
}
