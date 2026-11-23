import { AmountCard } from "@/components/ds/AmountCard";
import { CurrencyTotals } from "@/components/ledger/CurrencyTotals";
import { FeeLeakCard } from "@/components/ledger/FeeLeakCard";
import { MyShareCard } from "@/components/ledger/MyShareCard";
import type { MyShareView } from "@/lib/ledger/my-share";
import type { LedgerExpenseRow, TripMember } from "@/lib/ledger/types";
import type { CurrencyTotal } from "@/lib/ledger/stats";
import { formatKRW } from "@/lib/shared/format";

import { SettleStepMemberList } from "./SettleStepMemberList";

type Props = {
  me: TripMember | undefined;
  myShare: MyShareView;
  totalKrw: number;
  others: TripMember[];
  balances: Record<string, number>;
  currencyTotals: CurrencyTotal[];
  expenseRows: LedgerExpenseRow[];
  onExplain: () => void;
};

export function SettleStepSummary({
  me,
  myShare,
  totalKrw,
  others,
  balances,
  currencyTotals,
  expenseRows,
  onExplain,
}: Props) {
  return (
    <section
      aria-label="정산 요약"
      className="overflow-hidden rounded-mu-xl border border-mu-line bg-mu-card"
    >
      {me ? (
        <MyShareCard
          view={{
            ...myShare,
            hint: null,
          }}
          cardClassName="rounded-none border-0 pb-3"
          action={
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span
                className="text-mu-caption text-mu-fg-3"
                aria-label={`여행 총액 ${formatKRW(totalKrw)}`}
              >
                여행 총액{" "}
                <span className="mu-num font-semibold text-mu-fg-2">
                  {formatKRW(totalKrw)}
                </span>
                {myShare.mode === "estimate" ? " · 아직 예상" : null}
              </span>
              <button
                type="button"
                className="mu-focus min-h-tap text-mu-caption font-bold text-mu-accent"
                onClick={onExplain}
              >
                왜 이 금액?
              </button>
            </div>
          }
        />
      ) : (
        <AmountCard
          label="내 몫"
          amount={0}
          tone="neutral"
          sub="멤버로 합류하면 내 몫이 보여요"
          className="rounded-none border-0"
        />
      )}

      <SettleStepMemberList others={others} balances={balances} />

      <CurrencyTotals
        totals={currencyTotals}
        totalKrw={totalKrw}
        className="mx-4 mb-3 rounded-mu-lg bg-mu-sunken px-4 py-3"
      />

      <FeeLeakCard expenses={expenseRows} embedded />
    </section>
  );
}