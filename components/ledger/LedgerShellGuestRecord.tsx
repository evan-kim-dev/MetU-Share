import Link from "next/link";
import { LedgerShellExpenseList } from "@/components/ledger/LedgerShellExpenseList";
import type { LedgerExpenseRow, TripMember } from "@/lib/ledger/types";

type Props = {
  tripId: string;
  expenses: LedgerExpenseRow[];
  members: TripMember[];
  meId: string | undefined;
  isAnonymous: boolean;
  isOwner: boolean;
  dashboard: React.ReactNode;
  onExpenseChanged: () => void;
};

export function LedgerShellGuestRecord({
  tripId,
  expenses,
  members,
  meId,
  isAnonymous,
  isOwner,
  dashboard,
  onExpenseChanged,
}: Props) {
  return (
    <>
      {dashboard}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/trips/${tripId}/ledger/settle`}
          className="mu-focus flex min-h-tap items-center justify-center rounded-mu-lg border border-mu-line bg-mu-card text-mu-label font-bold text-mu-accent"
        >
          정산
        </Link>
        <Link
          href={`/trips/${tripId}/ledger/report`}
          className="mu-focus flex min-h-tap items-center justify-center rounded-mu-lg border border-mu-line bg-mu-card text-mu-label font-bold text-mu-accent"
        >
          리포트
        </Link>
      </div>
      <LedgerShellExpenseList
        tripId={tripId}
        expenses={expenses}
        members={members}
        meId={meId}
        isAnonymous={isAnonymous}
        isOwner={isOwner}
        onChanged={onExpenseChanged}
      />
    </>
  );
}