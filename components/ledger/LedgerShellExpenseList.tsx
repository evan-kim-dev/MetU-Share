import { ExpenseChipSplit } from "@/components/ledger/ExpenseChipSplit";
import type { LedgerExpenseRow, TripMember } from "@/lib/ledger/types";

type Props = {
  tripId: string;
  expenses: LedgerExpenseRow[];
  members: TripMember[];
  meId: string | undefined;
  isAnonymous: boolean;
  isOwner: boolean;
  onChanged: () => void;
};

export function LedgerShellExpenseList({
  tripId,
  expenses,
  members,
  meId,
  isAnonymous,
  isOwner,
  onChanged,
}: Props) {
  return (
    <section className="overflow-hidden rounded-mu-xl border border-mu-line bg-mu-card">
      <h2 className="border-b border-mu-line px-4 py-3 text-mu-heading text-mu-fg">
        지출 목록
      </h2>
      <ul className="flex flex-col gap-2 p-4">
        {expenses.length === 0 ? (
          <li className="text-mu-body text-mu-fg-3">아직 지출이 없어요.</li>
        ) : (
          expenses.map((e) => (
            <ExpenseChipSplit
              key={e.id}
              expense={e}
              members={members}
              meId={meId}
              isAnonymous={isAnonymous}
              isOwner={isOwner}
              settleHref={`/trips/${tripId}/ledger/settle`}
              onChanged={onChanged}
            />
          ))
        )}
      </ul>
    </section>
  );
}