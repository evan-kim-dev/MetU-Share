import {
  SPEND_CATEGORY_LABEL,
  type BenefitScope,
  type SpendBudget,
} from "@/lib/cards/types";

/** VERIFY: CODEF 카드사 기관코드 — 정식 연동 전 CODEF 기관코드표로 재확인 */
export const ORGANIZATIONS = [
  { code: "0301", label: "KB국민카드" },
  { code: "0302", label: "현대카드" },
  { code: "0303", label: "삼성카드" },
  { code: "0304", label: "NH농협카드" },
  { code: "0305", label: "BC카드" },
  { code: "0306", label: "신한카드" },
  { code: "0307", label: "씨티카드" },
  { code: "0309", label: "우리카드" },
  { code: "0311", label: "롯데카드" },
  { code: "0313", label: "하나카드" },
] as const;

export const DEFAULT_BUDGET: Required<SpendBudget> = {
  flight: 350_000,
  lodging: 300_000,
  food: 200_000,
  transport: 60_000,
  shopping: 90_000,
};

export const SCOPE_LABEL: Record<BenefitScope, string> = {
  ...SPEND_CATEGORY_LABEL,
  overseas: "해외결제",
};