import type { AgentEventRow, ResultItem } from "@/components/agent/agent-inbox-types";

/** result.reason 에 들어가는 매칭 실패 코드는 미리보기 문구로 쓰지 않는다. */
export const MATCH_REASON_CODES = new Set([
  "unassigned",
  "no_trips",
  "no_dates",
  "outside_window",
]);

export function previewText(event: AgentEventRow): string {
  const text =
    typeof event.payload?.text === "string" ? event.payload.text.trim() : "";
  if (text) return text.length > 120 ? `${text.slice(0, 120)}…` : text;
  if (event.result?.message) return event.result.message;
  if (event.result?.reason && !MATCH_REASON_CODES.has(event.result.reason)) {
    return event.result.reason;
  }
  return event.kind === "image" ? "영수증 이미지" : "자동 수집 이벤트";
}

export function isTestEvent(event: AgentEventRow): boolean {
  const text =
    typeof event.payload?.text === "string" ? event.payload.text.trim() : "";
  return text.startsWith("MTU-TEST");
}

export function autoItems(event: AgentEventRow): ResultItem[] {
  const items = event.result?.items ?? [];
  return items.filter((it) => it.decision === "auto_commit" && it.expenseId);
}

export function mergedItems(event: AgentEventRow): ResultItem[] {
  return (event.result?.items ?? []).filter(
    (it) => it.decision === "merged" && it.expenseId
  );
}

export function reviewItems(event: AgentEventRow): ResultItem[] {
  return (event.result?.items ?? []).filter((it) => it.decision === "review");
}

export function looksLikeJwtExpired(message: string): boolean {
  return /jwt|session|401|unauthorized|expired/i.test(message);
}

export function canEditDraft(status: string): boolean {
  return [
    "needs_review",
    "failed",
    "ignored",
    "unassigned",
    "received",
  ].includes(status);
}