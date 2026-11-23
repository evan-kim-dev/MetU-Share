"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  SPEND_CATEGORIES,
  SPEND_CATEGORY_LABEL,
  type SpendBudget,
} from "@/lib/cards/types";
import { formatKRW } from "@/lib/shared/format";

export function CardBenefitLabBudgetSection({
  budget,
  setBudget,
  total,
}: {
  budget: Required<SpendBudget>;
  setBudget: Dispatch<SetStateAction<Required<SpendBudget>>>;
  total: number;
}) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby="lab-budget">
      <div className="flex items-baseline justify-between">
        <h2 id="lab-budget" className="text-mu-heading text-mu-fg">
          2. 여행 예산
        </h2>
        <span className="mu-num text-mu-label text-mu-fg-2">
          합계 {formatKRW(total)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SPEND_CATEGORIES.map((c) => (
          <label
            key={c}
            className="flex flex-col gap-1 rounded-mu-md border border-mu-line bg-mu-card px-3 py-2"
          >
            <span className="text-mu-caption text-mu-fg-3">
              {SPEND_CATEGORY_LABEL[c]}
            </span>
            <input
              value={budget[c].toLocaleString("ko-KR")}
              inputMode="numeric"
              onChange={(e) => {
                const n = Number(e.target.value.replace(/[^0-9]/g, "")) || 0;
                setBudget((b) => ({ ...b, [c]: Math.min(n, 100_000_000) }));
              }}
              className="mu-num w-full bg-transparent text-mu-body font-bold text-mu-fg outline-none"
              aria-label={`${SPEND_CATEGORY_LABEL[c]} 예산(원)`}
            />
          </label>
        ))}
      </div>
    </section>
  );
}