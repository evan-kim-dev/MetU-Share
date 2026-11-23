import { Receipt } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { EmptyState } from "@/components/ds/EmptyState";
import { ExpenseRow } from "@/components/ds/ExpenseRow";
import type { AddExpenseTab } from "@/components/ledger/journey/host/AddExpenseSheet";
import type { PlanAlloc } from "@/lib/ledger/plan-match";
import type { LedgerExpenseRow, TripMember } from "@/lib/ledger/types";

import {
  expenseMeta,
  planHintForExpense,
} from "./record-step-utils";

type Props = {
  todayExpenses: LedgerExpenseRow[];
  members: TripMember[];
  planAllocation: ReadonlyArray<PlanAlloc>;
  onAdjust: () => void;
  onOpenAdd: (tab: AddExpenseTab) => void;
};

export function RecordStepTodayList({
  todayExpenses,
  members,
  planAllocation,
  onAdjust,
  onOpenAdd,
}: Props) {
  const nameOf = (id: string) =>
    members.find((m) => m.id === id)?.displayName;

  return (
    <section
      aria-labelledby="record-list-title"
      className="overflow-hidden rounded-mu-xl border border-mu-line bg-mu-card"
    >
      <div className="flex items-baseline justify-between gap-2 border-b border-mu-line px-4 pt-4 pb-3">
        <h2 id="record-list-title" className="text-mu-heading text-mu-fg">
          오늘 지출
        </h2>
        {todayExpenses.length > 0 ? (
          <button
            type="button"
            onClick={onAdjust}
            className="mu-focus min-h-11 text-mu-caption font-bold text-mu-accent"
          >
            분담 조정
          </button>
        ) : null}
      </div>
      {todayExpenses.length === 0 ? (
        <div className="px-2">
          <EmptyState
            icon={Receipt}
            title="아직 기록이 없어요"
            body="영수증을 찍거나 카드 문자를 붙여 넣으면 여기에 쌓여요."
            action={
              <Button onClick={() => onOpenAdd("receipt")}>
                <Receipt className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                영수증 올리기
              </Button>
            }
          />
        </div>
      ) : (
        <div className="px-4 pb-1">
          {todayExpenses.map((e) => {
            const hint = planHintForExpense(e, planAllocation);
            return (
              <ExpenseRow
                key={e.id}
                merchant={e.merchantKo || e.merchant || e.label || "지출"}
                amount={Number.isFinite(e.krwAmount) ? e.krwAmount : 0}
                meta={expenseMeta(e, nameOf(e.paidBy))}
                status={hint?.status ?? null}
                statusLabel={hint?.statusLabel}
                icon={
                  <Receipt
                    className="h-5 w-5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                }
                onClick={onAdjust}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}