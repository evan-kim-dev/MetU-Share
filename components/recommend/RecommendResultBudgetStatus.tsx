"use client";

import { cn } from "@/lib/design/tokens";
import { formatKRW } from "@/lib/shared/format";

export function RecommendResultBudgetStatus({
  slack,
  plannedTotal,
  totalBudget,
}: {
  slack: number;
  plannedTotal: number;
  totalBudget: number;
}) {
  return (
    <section
      className={cn(
        "rounded-mu-xl border px-4 py-4",
        slack >= 0
          ? "border-mu-ok/30 bg-mu-ok-soft"
          : "border-mu-err/30 bg-mu-err-soft"
      )}
      aria-label="예산 여유"
    >
      <p className="text-mu-caption font-medium text-mu-fg-2">예산 상태</p>
      <p className="mu-num mt-1 text-xl font-bold text-mu-fg">
        {slack >= 0
          ? `여유 ${formatKRW(slack)}`
          : `초과 ${formatKRW(Math.abs(slack))}`}
      </p>
      <p className="mt-1 text-mu-caption text-mu-fg-3">
        계획 합 {formatKRW(plannedTotal)} · 총예산 {formatKRW(totalBudget)}
      </p>
    </section>
  );
}