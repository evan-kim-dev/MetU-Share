"use client";

import { FxAttribution } from "@/components/fx/FxAttribution";
import { formatKRW } from "@/lib/shared/format";

type FxMeta = {
  rateDate: string | null;
  source: string;
  isFallback: boolean;
};

type Breakdown = {
  krwBase: number;
  feeKrw: number;
  krwAmount: number;
};

type Props = {
  breakdown: Breakdown | null;
  fxRate: number | null;
  fxMeta: FxMeta | null;
  fxLoadFailed: boolean;
  currency: string;
  paymentMethod: "card" | "cash" | "transfer";
  manualFxDraft: string;
  onFxRateChange: (rate: number) => void;
  onManualFxInput: (value: string) => void;
};

export function ExpenseConfirmFxSection({
  breakdown,
  fxRate,
  fxMeta,
  fxLoadFailed,
  currency,
  paymentMethod,
  manualFxDraft,
  onFxRateChange,
  onManualFxInput,
}: Props) {
  if (breakdown && fxRate != null) {
    return (
      <div className="rounded-xl bg-mu-sunken px-3 py-2 text-xs">
        <p className="font-bold text-mu-fg">
          약 {formatKRW(breakdown.krwBase)}
          {breakdown.feeKrw > 0
            ? ` + 수수료 ${formatKRW(breakdown.feeKrw)}`
            : ""}{" "}
          = {formatKRW(breakdown.krwAmount)}
        </p>
        <p className="mt-1 text-mu-fg-3">
          환율 {fxRate}
          {fxMeta?.rateDate
            ? fxMeta.isFallback
              ? ` · 마지막 업데이트 ${fxMeta.rateDate}`
              : ` · 기준일 ${fxMeta.rateDate}`
            : ""}
          {fxMeta?.source === "cash_manual" ? " · 현금 환율" : " · 일자별"}
          {fxMeta?.isFallback ? " · 대체값(확인 필요)" : ""}
        </p>
        <label className="mt-2 flex items-center gap-2">
          <span>환율 직접 수정</span>
          <input
            inputMode="decimal"
            className="w-28 rounded border border-mu-line px-2 py-1"
            value={String(fxRate)}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n > 0) onFxRateChange(n);
            }}
          />
        </label>
        <FxAttribution />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-mu-sunken px-3 py-2 text-xs">
      <p className="font-semibold text-mu-err">
        {paymentMethod === "cash"
          ? "현금 환율을 입력하거나 설정해 주세요."
          : fxLoadFailed
            ? "환율을 불러올 수 없어요. 직접 입력해 주세요"
            : "환율을 불러오는 중이에요…"}
      </p>
      {currency !== "KRW" && paymentMethod !== "cash" ? (
        <label className="mt-2 flex items-center gap-2">
          <span>1 {currency} =</span>
          <input
            inputMode="decimal"
            className="w-28 rounded border border-mu-line-strong bg-mu-card px-2 py-1"
            value={manualFxDraft}
            placeholder="원화"
            onChange={(e) => onManualFxInput(e.target.value)}
          />
          <span>원</span>
        </label>
      ) : null}
      <FxAttribution />
    </div>
  );
}