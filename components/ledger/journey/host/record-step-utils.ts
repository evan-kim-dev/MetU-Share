import {
  ClipboardPaste,
  Mic,
  Receipt,
} from "lucide-react";
import type { AddExpenseTab } from "@/components/ledger/journey/host/AddExpenseSheet";
import {
  isTravelBigTicket,
  matchExpenseToPlan,
  type PlanAlloc,
} from "@/lib/ledger/plan-match";
import type { LedgerExpenseRow } from "@/lib/ledger/types";
import { formatKRW } from "@/lib/shared/format";

import type { PlanHint } from "./record-step-types";

export function sortRecent(list: LedgerExpenseRow[]): LedgerExpenseRow[] {
  return [...list].sort((a, b) => {
    const ka = a.paidAt ?? a.spentOn ?? "";
    const kb = b.paidAt ?? b.spentOn ?? "";
    return kb.localeCompare(ka);
  });
}

export function expenseMeta(
  e: LedgerExpenseRow,
  payer: string | undefined
): string {
  const parts: string[] = [];
  if (e.spentOn) parts.push(e.spentOn.slice(5).replace("-", "/"));
  if (e.currency && e.currency !== "KRW" && Number.isFinite(e.amount)) {
    parts.push(`${e.amount.toLocaleString("ko-KR")} ${e.currency}`);
  }
  if (payer) parts.push(`${payer} 결제`);
  return parts.join(" · ");
}

export const QUICK_ACTIONS: Array<{
  tab: AddExpenseTab;
  label: string;
  icon: typeof Receipt;
}> = [
  { tab: "receipt", label: "영수증", icon: Receipt },
  { tab: "paste", label: "붙여넣기", icon: ClipboardPaste },
  { tab: "voice", label: "음성", icon: Mic },
];

export function planHintForExpense(
  e: LedgerExpenseRow,
  planAllocation: ReadonlyArray<PlanAlloc>
): PlanHint {
  const label = e.merchantKo || e.merchant || e.label || "";
  if (!isTravelBigTicket(e.category, label)) return null;
  const match = matchExpenseToPlan({
    category: e.category,
    label,
    merchant: e.merchant,
    krwAmount: e.krwAmount,
    allocation: planAllocation,
  });
  if (!match) {
    return {
      status: "review",
      statusLabel: "항공·숙소 · 플랜과 따로 확인",
    };
  }
  const delta = match.deltaKrw;
  const deltaLabel =
    delta === 0
      ? "플랜과 같아요"
      : delta > 0
        ? `플랜보다 ${formatKRW(delta)} 더`
        : `플랜보다 ${formatKRW(-delta)} 덜`;
  return {
    status: "review",
    statusLabel: `${match.allocLabel} 예상 ${formatKRW(match.planAmountKrw)} · ${deltaLabel}`,
  };
}