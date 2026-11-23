export const EXPENSE_CONFIRM_CATEGORIES = [
  "식비",
  "교통",
  "숙소",
  "관광",
  "쇼핑",
  "기타",
] as const;

export type ExpenseConfirmCategory =
  (typeof EXPENSE_CONFIRM_CATEGORIES)[number];