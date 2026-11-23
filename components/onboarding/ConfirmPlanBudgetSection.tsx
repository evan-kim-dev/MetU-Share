"use client";

import { BudgetSlimBar } from "@/components/ds";
import { formatKRW } from "@/lib/shared/format";

export function ConfirmPlanBudgetSection({
  budget,
  segments,
}: {
  budget: number;
  segments: Array<{ id: string; label: string; percent: number }>;
}) {
  return (
    <section className="rounded-mu-xl border border-mu-line bg-mu-card p-5">
      <p className="text-mu-caption text-mu-fg-3">총 예산</p>
      <p className="mu-num mt-1 text-2xl font-bold text-mu-fg">
        {budget > 0 ? formatKRW(budget) : "₩0"}
      </p>
      <BudgetSlimBar
        className="mt-4"
        segments={segments.map((s) => ({
          id: s.id,
          label: s.label,
          percent: s.percent,
        }))}
      />
      <p className="mt-2 text-mu-caption text-mu-fg-3">
        분배는 미리보기예요. 확정 금액은 일정 생성 후 맞춰져요.
      </p>
    </section>
  );
}
