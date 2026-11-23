"use client";

import { useEffect, useMemo, useState } from "react";
import {
  findDuplicateCandidates,
  type DuplicateCandidate,
} from "@/lib/ledger/dedupe";
import { getFxQuote } from "@/lib/ledger/fx";
import { computeKrw } from "@/lib/ledger/money";
import { computeShares } from "@/lib/ledger/settle";
import { listExpenses, saveExpense } from "@/lib/ledger/supabase";
import { useCurrencyOptions } from "@/lib/fx/currency-list";
import { getBrowserSupabase } from "@/lib/supabase/browser";

import type { ExpenseConfirmSheetProps } from "./expense-confirm-types";

export type ExpenseConfirmFxMeta = {
  rateDate: string | null;
  source: string;
  isFallback: boolean;
};

export type ExpenseConfirmBreakdown = {
  krwBase: number;
  feeKrw: number;
  krwAmount: number;
};

export function useExpenseConfirmSheet({
  tripId,
  members,
  drafts,
  index,
  onIndexChange,
  onClose,
  onSaved,
  cardProfiles = [],
}: ExpenseConfirmSheetProps) {
  const draft = drafts[index];
  const [merchant, setMerchant] = useState(draft?.merchant ?? "");
  const [merchantKo, setMerchantKo] = useState(draft?.merchantKo ?? "");
  const [amount, setAmount] = useState(String(draft?.amount ?? ""));
  const [currency, setCurrency] = useState(
    (draft?.currency ?? "KRW").toUpperCase()
  );
  const [spentOn, setSpentOn] = useState(draft?.spentOn ?? "");
  const [category, setCategory] = useState(draft?.category ?? "기타");
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "cash" | "transfer"
  >(draft?.paymentMethod ?? "card");
  const [payerId, setPayerId] = useState(
    draft?.payerMemberId ?? members.find((m) => m.isOwner)?.id ?? members[0]?.id ?? ""
  );
  const [participants, setParticipants] = useState<string[]>(
    draft?.participantMemberIds?.length
      ? draft.participantMemberIds
      : members.map((m) => m.id)
  );
  const [splitType, setSplitType] = useState<"equal" | "fixed" | "ratio">(
    draft?.splitType === "fixed" || draft?.splitType === "ratio"
      ? draft.splitType
      : "equal"
  );
  const [cardProfileId, setCardProfileId] = useState<string>("");
  const currencyOptions = useCurrencyOptions();
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [fxMeta, setFxMeta] = useState<ExpenseConfirmFxMeta | null>(null);
  const [fxLoadFailed, setFxLoadFailed] = useState(false);
  const [manualFxDraft, setManualFxDraft] = useState("");
  const [feeUnset, setFeeUnset] = useState(true);
  const [feeRate, setFeeRate] = useState<number | null>(null);
  const [feeFlat, setFeeFlat] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dupes, setDupes] = useState<DuplicateCandidate[]>([]);
  const [ignoreDupes, setIgnoreDupes] = useState(false);

  useEffect(() => {
    if (!draft) return;
    setMerchant(draft.merchant ?? "");
    setMerchantKo(draft.merchantKo ?? "");
    setAmount(String(draft.amount ?? ""));
    setCurrency((draft.currency ?? "KRW").toUpperCase());
    setSpentOn(draft.spentOn ?? "");
    setCategory(draft.category ?? "기타");
    setPaymentMethod(draft.paymentMethod ?? "card");
    setPayerId(
      draft.payerMemberId ??
        members.find((m) => m.isOwner)?.id ??
        members[0]?.id ??
        ""
    );
    setParticipants(
      draft.participantMemberIds?.length
        ? draft.participantMemberIds
        : members.map((m) => m.id)
    );
    setSplitType(
      draft.splitType === "fixed" || draft.splitType === "ratio"
        ? draft.splitType
        : "equal"
    );
    setError("");
    setIgnoreDupes(false);
    setDupes([]);
  }, [draft, members, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    async function loadFx() {
      if (!spentOn || !currency || !payerId) return;
      setFxLoadFailed(false);
      const q = await getFxQuote({
        tripId,
        currency,
        date: spentOn,
        paymentMethod,
        payerMemberId: payerId,
      });
      if (cancelled) return;
      if (q) {
        setFxRate(q.rate);
        setFxMeta({
          rateDate: q.rateDate,
          source: q.source,
          isFallback: q.isFallback,
        });
        setManualFxDraft(String(q.rate));
        setFxLoadFailed(false);
      } else if (currency === "KRW") {
        setFxRate(1);
        setFxMeta({ rateDate: spentOn, source: "auto_daily", isFallback: false });
        setManualFxDraft("1");
        setFxLoadFailed(false);
      } else {
        setFxRate(null);
        setFxMeta(null);
        setManualFxDraft("");
        setFxLoadFailed(true);
      }
    }
    void loadFx();
    return () => {
      cancelled = true;
    };
  }, [tripId, currency, spentOn, paymentMethod, payerId]);

  useEffect(() => {
    const p = cardProfiles.find((c) => c.id === cardProfileId);
    if (!p) {
      setFeeUnset(true);
      setFeeRate(null);
      setFeeFlat(0);
      return;
    }
    setFeeUnset(p.fee_rate == null);
    setFeeRate(p.fee_rate);
    setFeeFlat(p.fee_flat_krw ?? 0);
  }, [cardProfileId, cardProfiles]);

  const amountNum = Number(amount);

  useEffect(() => {
    let cancelled = false;
    async function checkDupes() {
      if (!draft || !(amountNum > 0) || !currency || !spentOn) {
        setDupes([]);
        return;
      }
      const supabase = getBrowserSupabase();
      if (!supabase) return;
      const existing = await listExpenses(supabase, tripId);
      if (cancelled) return;
      const hits = findDuplicateCandidates(
        {
          currency,
          amount: amountNum,
          merchant: merchant || draft.merchant || "",
          spentOn,
          paidAt: draft.paidAt,
          kind: draft.kind,
          fxRateToKrw: fxRate ?? undefined,
        },
        existing.map((e) => ({
          id: e.id,
          currency: e.currency,
          amount: e.amount,
          merchant: e.merchant || e.label,
          spentOn: e.spentOn ?? "",
          krwAmount: e.krwAmount,
          paidAt: e.paidAt,
        }))
      );
      setDupes(hits);
    }
    void checkDupes();
    return () => {
      cancelled = true;
    };
  }, [draft, tripId, amountNum, currency, spentOn, merchant, fxRate]);

  const breakdown = useMemo((): ExpenseConfirmBreakdown | null => {
    if (!(amountNum > 0) || !(fxRate && fxRate > 0)) return null;
    return computeKrw({
      amount: amountNum,
      fxRate,
      feeRate: paymentMethod === "card" ? feeRate : 0,
      feeFlatKrw: paymentMethod === "card" ? feeFlat : 0,
    });
  }, [amountNum, fxRate, feeRate, feeFlat, paymentMethod]);

  const sharesOk = useMemo(() => {
    if (!breakdown) return false;
    const r = computeShares({
      type: splitType === "fixed" || splitType === "ratio" ? "equal" : splitType,
      krwAmount: breakdown.krwAmount,
      participants,
    });
    // confirm sheet: equal only for save path unless fixed inputs added later
    return r.ok && participants.length > 0;
  }, [breakdown, splitType, participants]);

  const canSave =
    Boolean(merchant.trim()) &&
    amountNum > 0 &&
    Boolean(currency) &&
    Boolean(spentOn) &&
    Boolean(payerId) &&
    Boolean(breakdown) &&
    sharesOk &&
    !(fxMeta?.isFallback && fxRate == null) &&
    (dupes.length === 0 || ignoreDupes);

  async function handleSave() {
    if (!canSave || !breakdown || !fxRate) return;
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("로그인이 필요해요.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const row = await saveExpense(supabase, {
        tripId,
        paidBy: payerId,
        merchant: merchant.trim(),
        merchantKo: merchantKo.trim() || null,
        category,
        amount: amountNum,
        currency,
        paymentMethod,
        cardProfileId: cardProfileId || null,
        cardLabel:
          cardProfiles.find((c) => c.id === cardProfileId)?.label ?? null,
        fxRate,
        fxRateDate: fxMeta?.rateDate ?? null,
        fxSource: fxMeta?.source === "cash_manual" ? "cash_manual" : "auto_daily",
        fxIsFallback: fxMeta?.isFallback ?? false,
        feeRate: paymentMethod === "card" ? feeRate : 0,
        feeFlatKrw: paymentMethod === "card" ? feeFlat : 0,
        source:
          draft?.source === "receipt"
            ? "receipt"
            : draft?.source === "voice"
              ? "voice"
              : draft?.source === "sms" || draft?.source === "push"
                ? "sms"
                : "manual",
        rawInput: draft?.rawInput ?? null,
        items: draft?.items ?? [],
        spentOn,
        paidAt: draft?.paidAt ?? null,
        splitType: "equal",
        participants,
      });
      if (!row) {
        setError("저장에 실패했어요.");
        return;
      }
      if (index + 1 < drafts.length) onIndexChange(index + 1);
      else {
        onSaved(row);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  function handleManualFxInput(value: string) {
    setManualFxDraft(value);
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) {
      setFxRate(n);
      setFxMeta({
        rateDate: spentOn,
        source: "cash_manual",
        isFallback: true,
      });
    } else {
      setFxRate(null);
    }
  }

  function toggleParticipant(memberId: string) {
    setParticipants((prev) => {
      const on = prev.includes(memberId);
      return on ? prev.filter((id) => id !== memberId) : [...prev, memberId];
    });
  }

  const title =
    drafts.length > 1
      ? `지출 확인 (${index + 1}/${drafts.length})`
      : "지출 확인";

  return {
    draft,
    title,
    merchant,
    setMerchant,
    merchantKo,
    setMerchantKo,
    amount,
    setAmount,
    currency,
    setCurrency,
    spentOn,
    setSpentOn,
    category,
    setCategory,
    paymentMethod,
    setPaymentMethod,
    payerId,
    setPayerId,
    participants,
    toggleParticipant,
    cardProfileId,
    setCardProfileId,
    currencyOptions,
    fxRate,
    setFxRate,
    fxMeta,
    fxLoadFailed,
    manualFxDraft,
    handleManualFxInput,
    feeUnset,
    saving,
    error,
    dupes,
    ignoreDupes,
    setIgnoreDupes,
    breakdown,
    canSave,
    handleSave,
    members,
    cardProfiles,
  };
}
