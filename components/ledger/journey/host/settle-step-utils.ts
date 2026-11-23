import type { LedgerExpense } from "@/lib/ledger/settle";
import type { LedgerExpenseRow } from "@/lib/ledger/types";
import { formatKRW } from "@/lib/shared/format";

export function signedKRW(value: number): string {
  if (value > 0) return `+${formatKRW(value)}`;
  if (value < 0) return `-${formatKRW(-value)}`;
  return formatKRW(0);
}

export function balanceTone(value: number): string {
  if (value > 0) return "text-mu-ok";
  if (value < 0) return "text-mu-warn";
  return "text-mu-fg-3";
}

export function toSettleExpense(row: LedgerExpenseRow): LedgerExpense {
  return {
    id: row.id,
    paidBy: row.paidBy,
    krwAmount: row.krwAmount,
    shares: row.shares,
  };
}