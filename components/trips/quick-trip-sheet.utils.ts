export type QuickTripSheetReason = "first-run" | "inbox" | "hub";

export type QuickTripPhase = "idle" | "submitting" | "error";

export const QUICK_TRIP_SUBTITLE: Record<QuickTripSheetReason, string> = {
  "first-run":
    "알림과 지출을 담을 여행 하나만 먼저 만들어요. 일정과 예산은 나중에 채워도 돼요.",
  hub: "알림과 지출을 담을 여행 하나만 먼저 만들어요. 일정과 예산은 나중에 채워도 돼요.",
  inbox: "여행을 만들면 기간이 맞는 알림이 자동으로 이 여행에 붙어요.",
};

export function formatMd(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${Number(m[2])}월 ${Number(m[3])}일`;
}

export function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
