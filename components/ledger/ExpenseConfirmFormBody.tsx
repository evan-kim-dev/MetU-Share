"use client";

import type { TripMember } from "@/lib/ledger/types";

import { EXPENSE_CONFIRM_CATEGORIES } from "./expense-confirm-constants";
import type { ExpenseConfirmCardProfile } from "./expense-confirm-types";
import { ExpenseConfirmFxSection } from "./ExpenseConfirmFxSection";
import type {
  ExpenseConfirmBreakdown,
  ExpenseConfirmFxMeta,
} from "./useExpenseConfirmSheet";

type CurrencyOption = { code: string; label: string };

type Props = {
  merchant: string;
  onMerchantChange: (v: string) => void;
  merchantKo: string;
  onMerchantKoChange: (v: string) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
  currencyOptions: readonly CurrencyOption[];
  spentOn: string;
  onSpentOnChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  paymentMethod: "card" | "cash" | "transfer";
  onPaymentMethodChange: (m: "card" | "cash" | "transfer") => void;
  cardProfiles: readonly ExpenseConfirmCardProfile[];
  cardProfileId: string;
  onCardProfileIdChange: (v: string) => void;
  payerId: string;
  onPayerIdChange: (v: string) => void;
  members: readonly TripMember[];
  participants: readonly string[];
  onToggleParticipant: (memberId: string) => void;
  breakdown: ExpenseConfirmBreakdown | null;
  fxRate: number | null;
  fxMeta: ExpenseConfirmFxMeta | null;
  fxLoadFailed: boolean;
  manualFxDraft: string;
  onFxRateChange: (n: number) => void;
  onManualFxInput: (value: string) => void;
};

export function ExpenseConfirmFormBody({
  merchant,
  onMerchantChange,
  merchantKo,
  onMerchantKoChange,
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
  currencyOptions,
  spentOn,
  onSpentOnChange,
  category,
  onCategoryChange,
  paymentMethod,
  onPaymentMethodChange,
  cardProfiles,
  cardProfileId,
  onCardProfileIdChange,
  payerId,
  onPayerIdChange,
  members,
  participants,
  onToggleParticipant,
  breakdown,
  fxRate,
  fxMeta,
  fxLoadFailed,
  manualFxDraft,
  onFxRateChange,
  onManualFxInput,
}: Props) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold">상호(원문)</span>
        <input
          className="rounded-lg border border-mu-line px-3 py-2"
          value={merchant}
          onChange={(e) => onMerchantChange(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold">상호(한국어)</span>
        <input
          className="rounded-lg border border-mu-line px-3 py-2"
          value={merchantKo}
          onChange={(e) => onMerchantKoChange(e.target.value)}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold">금액</span>
          <input
            inputMode="decimal"
            className="rounded-lg border border-mu-line px-3 py-2"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold">통화</span>
          <select
            className="rounded-lg border border-mu-line px-3 py-2"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
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
          onChange={(e) => onSpentOnChange(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold">카테고리</span>
        <select
          className="rounded-lg border border-mu-line px-3 py-2"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
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
            onClick={() => onPaymentMethodChange(m)}
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
            onChange={(e) => onCardProfileIdChange(e.target.value)}
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
          onChange={(e) => onPayerIdChange(e.target.value)}
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
                  onChange={() => onToggleParticipant(m.id)}
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
        onFxRateChange={onFxRateChange}
        onManualFxInput={onManualFxInput}
      />
    </div>
  );
}
