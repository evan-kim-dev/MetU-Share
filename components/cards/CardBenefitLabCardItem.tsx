"use client";

import { CreditCard } from "lucide-react";
import { SCOPE_LABEL } from "@/components/cards/card-benefit-lab.constants";
import { benefitAmountText } from "@/components/cards/card-benefit-lab.helpers";
import type { CardSnapshot } from "@/lib/cards/types";
import { cn } from "@/lib/design/tokens";
import { formatKRW } from "@/lib/shared/format";

function PerformanceBar({ card }: { card: CardSnapshot }) {
  const { currentKrw, standardKrw, requiredKrw, met } = card.performance;
  if (standardKrw == null || currentKrw == null) {
    return <p className="text-mu-caption text-mu-fg-3">실적 정보가 없어요</p>;
  }
  const pct = Math.min(
    100,
    Math.round((currentKrw / Math.max(1, standardKrw)) * 100)
  );
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-mu-caption">
        <span className="text-mu-fg-2">
          이번 달 실적{" "}
          <b className="mu-num text-mu-fg">{formatKRW(currentKrw)}</b> /{" "}
          {formatKRW(standardKrw)}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-bold",
            met ? "bg-mu-ok-soft text-mu-ok" : "bg-mu-warn-soft text-mu-warn"
          )}
        >
          {met ? "충족" : `${formatKRW(requiredKrw ?? 0)} 부족`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-mu-sunken" aria-hidden>
        <div
          className={cn("h-full rounded-full", met ? "bg-mu-ok" : "bg-mu-warn")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function CardBenefitLabCardItem({ card }: { card: CardSnapshot }) {
  return (
    <li className="flex flex-col gap-3 rounded-mu-xl border border-mu-line bg-mu-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-mu-md bg-mu-accent-soft text-mu-accent">
          <CreditCard className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-mu-body font-bold text-mu-fg">{card.name}</p>
          <p className="text-mu-caption text-mu-fg-3">
            {card.company ?? "카드사 미상"} · ****{card.last4 ?? "----"}
          </p>
        </div>
      </div>
      <PerformanceBar card={card} />
      <ul className="flex flex-col gap-2">
        {card.benefits.map((b, i) => (
          <li key={i} className="rounded-mu-md bg-mu-sunken px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-mu-label text-mu-fg">{b.name}</p>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-mu-caption font-bold",
                  b.status === "parsed"
                    ? "bg-mu-accent-soft text-mu-accent"
                    : "bg-mu-warn-soft text-mu-warn"
                )}
              >
                {b.status === "parsed" ? "해석 완료" : "확인 필요"}
              </span>
            </div>
            <p className="mt-1 text-mu-caption text-mu-fg-2">
              {benefitAmountText(b)}
            </p>
            {b.scopes.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {b.scopes.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-mu-line px-2 py-0.5 text-mu-caption text-mu-fg-2"
                  >
                    {SCOPE_LABEL[s]}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </li>
  );
}