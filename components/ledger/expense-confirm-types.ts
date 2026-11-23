import type { ExpenseDraftInput } from "@/lib/ledger/draft";
import type { LedgerExpenseRow, TripMember } from "@/lib/ledger/types";

export type ExpenseConfirmCardProfile = {
  id: string;
  label: string;
  fee_rate: number | null;
  fee_flat_krw: number;
};

export type ExpenseConfirmSheetProps = {
  tripId: string;
  members: TripMember[];
  drafts: ExpenseDraftInput[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  /** 하위 호환: 인자 없이 호출해도 됨. 저장 행을 넘기면 제안 승인에 재사용. */
  onSaved: (row?: LedgerExpenseRow) => void;
  cardProfiles?: ExpenseConfirmCardProfile[];
};