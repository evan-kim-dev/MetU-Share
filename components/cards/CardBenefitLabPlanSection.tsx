"use client";

import { Sparkles } from "lucide-react";
import {
  SPEND_CATEGORY_LABEL,
  type CardSnapshot,
} from "@/lib/cards/types";
import type { SpendPlan } from "@/lib/cards/types";
import { cn } from "@/lib/design/tokens";
import { formatKRW } from "@/lib/shared/format";

export function CardBenefitLabPlanSection({
  plan,
  cards,
}: {
  plan: SpendPlan;
  cards: CardSnapshot[];
}) {
  const cardName = (id: string | null) =>
    cards.find((c) => c.id === id)?.name ?? "—";

  return (
    <section className="flex flex-col gap-3" aria-labelledby="lab-result">
      <h2 id="lab-result" className="text-mu-heading text-mu-fg">
        3. 카드별 결제 계획
      </h2>
      <div className="rounded-mu-xl border border-mu-line bg-mu-card p-4">
        <p className="flex items-center gap-1.5 text-mu-label text-mu-fg-3">
          <Sparkles className="h-4 w-4 text-mu-accent" aria-hidden />
          예상 할인
        </p>
        <p className="mu-num mt-1 text-mu-amount-xl text-mu-accent">
          {formatKRW(plan.confirmedDiscountKrw)}
        </p>
        {plan.conditionalDiscountKrw > 0 ? (
          <p className="mt-1 text-mu-caption text-mu-fg-2">
            + 실적을 채우면 {formatKRW(plan.conditionalDiscountKrw)} 더 (조건부)
          </p>
        ) : null}
      </div>

      <ul className="flex flex-col divide-y divide-mu-line rounded-mu-xl border border-mu-line bg-mu-card">
        {plan.categories.map((p) => (
          <li key={p.category} className="flex flex-col gap-0.5 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-mu-label font-bold text-mu-fg">
                {SPEND_CATEGORY_LABEL[p.category]}
                <span className="mu-num ml-1.5 font-medium text-mu-fg-3">
                  {formatKRW(p.budgetKrw)}
                </span>
              </span>
              <span
                className={cn(
                  "mu-num text-mu-label font-bold",
                  p.discountKrw > 0
                    ? p.conditional
                      ? "text-mu-warn"
                      : "text-mu-ok"
                    : "text-mu-fg-3"
                )}
              >
                {p.discountKrw > 0 ? `−${formatKRW(p.discountKrw)}` : "0원"}
              </span>
            </div>
            <p className="text-mu-caption text-mu-fg-2">
              {p.cardId ? (
                <>
                  <b className="text-mu-fg">{cardName(p.cardId)}</b> · {p.benefitName}
                  {p.conditional ? " · 실적 충족 시" : ""}
                </>
              ) : (
                "아무 카드나 괜찮아요"
              )}
            </p>
            <p className="text-mu-caption text-mu-fg-3">{p.note}</p>
          </li>
        ))}
      </ul>

      <ul className="flex flex-col gap-2">
        {plan.cards
          .filter((s) => s.shortfallKrw > 0)
          .map((s) => (
            <li
              key={s.cardId}
              className="rounded-mu-md bg-mu-accent-soft px-3 py-2 text-mu-caption text-mu-fg"
            >
              <b>{cardName(s.cardId)}</b>: 실적 {formatKRW(s.shortfallKrw)} 부족 —{" "}
              {s.fillsShortfall
                ? `이번 여행 결제 ${formatKRW(s.assignedSpendKrw)}로 채울 수 있어요`
                : `이번 여행 결제 ${formatKRW(s.assignedSpendKrw)}로는 부족해요`}
            </li>
          ))}
      </ul>
      <p className="text-mu-caption text-mu-fg-3">
        할인은 혜택 문구를 규칙으로 읽어 계산한 추정치예요. 정액 혜택은 1회 기준, 해외결제 혜택은 현지 결제(식비·교통·쇼핑)에만 적용했어요. 실제 청구 금액은 카드사 약관을 따라요.
      </p>
    </section>
  );
}