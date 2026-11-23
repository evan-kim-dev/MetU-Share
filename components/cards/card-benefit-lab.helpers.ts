import { normalizeCodefCard } from "@/lib/cards/benefits";
import { toCardList } from "@/lib/cards/codef-schema";
import { DEMO_CODEF_DATA } from "@/lib/cards/mock";
import type { CardSnapshot, ParsedBenefit } from "@/lib/cards/types";
import { formatKRW } from "@/lib/shared/format";

export function demoCards(): CardSnapshot[] {
  return toCardList(DEMO_CODEF_DATA).map((c, i) => normalizeCodefCard(c, i));
}

export function benefitAmountText(b: ParsedBenefit): string {
  const parts: string[] = [];
  if (b.rate != null)
    parts.push(
      `${+(b.rate * 100).toFixed(2)}% ${b.kind === "reward" ? "적립" : "할인"}`
    );
  if (b.flatKrw != null) parts.push(`건당 ${formatKRW(b.flatKrw)}`);
  parts.push(
    b.monthlyCapKrw != null
      ? `월 한도 ${formatKRW(b.monthlyCapKrw)}`
      : "한도 미상"
  );
  return parts.join(" · ");
}