"use client";

import { useEffect, useMemo, useState } from "react";
import { Sheet } from "@/components/ds/Sheet";
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

import { EXPENSE_CONFIRM_CATEGORIES } from "./expense-confirm-constants";
import type { ExpenseConfirmSheetProps } from "./expense-confirm-types";
import { ExpenseConfirmDuplicateBanner } from "./ExpenseConfirmDuplicateBanner";
import { ExpenseConfirmFxSection } from "./ExpenseConfirmFxSection";
import { ExpenseConfirmWarnings } from "./ExpenseConfirmWarnings";

export function ExpenseConfirmSheet({
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
  const [fxMeta, setFxMeta] = useState<{
    rateDate: string | null;
    source: string;
    isFallback: boolean;
  } | null>(null);
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
  const breakdown = useMemo(() => {
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

  if (!draft) return null;

  const title =
    drafts.length > 1
      ? `지출 확인 (${index + 1}/${drafts.length})`
      : "지출 확인";

  return (
    <Sheet
      open
      onClose={onClose}
      title={title}
      footer={
        <button
          type="button"
          disabled={!canSave || saving}
          className="min-h-[52px] w-full rounded-xl bg-mu-accent py-3 text-sm font-extrabold text-mu-on-accent disabled:opacity-40"
          onClick={() => void handleSave()}
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      }
    >
      {dupes.length > 0 && !ignoreDupes ? (
        <ExpenseConfirmDuplicateBanner
          dupes={dupes}
          onClose={onClose}
          onIgnore={() => setIgnoreDupes(true)}
        />
      ) : null}

      <ExpenseConfirmWarnings
        draft={draft}
        feeUnset={feeUnset}
        paymentMethod={paymentMethod}
      />

      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold">상호(원문)</span>
          <input
            className="rounded-lg border border-mu-line px-3 py-2"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold">상호(한국어)</span>
          <input
            className="rounded-lg border border-mu-line px-3 py-2"
            value={merchantKo}
            onChange={(e) => setMerchantKo(e.target.value)}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold">금액</span>
            <input
              inputMode="decimal"
              className="rounded-lg border border-mu-line px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold">통화</span>
            <select
              className="rounded-lg border border-mu-line px-3 py-2"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {!currencyOptions.some((o) => o.code === currency) ? (
                <option value={currency}>{currency}</option>
              ) : null}
              {currencyOptions.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold">날짜</span>
          <input
            type="date"
            className="rounded-lg border border-mu-line px-3 py-2"
            value={spentOn}
            onChange={(e) => setSpentOn(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold">카테고리</span>
          <select
            className="rounded-lg border border-mu-line px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {EXPENSE_CONFIRM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          {(["card", "cash", "transfer"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                paymentMethod === m
                  ? "bg-mu-accent text-mu-on-accent"
                  : "bg-mu-sunken text-mu-fg-2"
              }`}
              onClick={() => setPaymentMethod(m)}
            >
              {m === "card" ? "카드" : m === "cash" ? "현금" : "이체"}
            </button>
          ))}
        </div>
        {paymentMethod === "card" && cardProfiles.length > 0 ? (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold">카드 프로필</span>
            <select
              className="rounded-lg border border-mu-line px-3 py-2"
              value={cardProfileId}
              onChange={(e) => setCardProfileId(e.target.value)}
            >
              <option value="">선택 안 함</option>
              {cardProfiles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold">결제자</span>
          <select
            className="rounded-lg border border-mu-line px-3 py-2"
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="flex flex-col gap-1">
          <legend className="text-xs font-bold">참여자</legend>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const on = participants.includes(m.id);
              return (
                <label
                  key={m.id}
                  className={`cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold ${
                    on ? "bg-mu-accent/15 text-mu-accent" : "bg-mu-sunken"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={on}
                    onChange={() =>
                      setParticipants((prev) =>
                        on
                          ? prev.filter((id) => id !== m.id)
                          : [...prev, m.id]
                      )
                    }
                  />
                  {m.displayName}
                </label>
              );
            })}
          </div>
        </fieldset>

        <ExpenseConfirmFxSection
          breakdown={breakdown}
          fxRate={fxRate}
          fxMeta={fxMeta}
          fxLoadFailed={fxLoadFailed}
          currency={currency}
          paymentMethod={paymentMethod}
          manualFxDraft={manualFxDraft}
          onFxRateChange={(n) => setFxRate(n)}
          onManualFxInput={(value) => {
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
          }}
        />
      </div>

      {error ? (
        <p className="mt-2 text-xs font-semibold text-mu-err">{error}</p>
      ) : null}
    </Sheet>
  );
}