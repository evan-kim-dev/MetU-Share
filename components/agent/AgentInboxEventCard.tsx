import type { ReactNode } from "react";
import type { AgentEventRow, Suggestion, TripOption } from "@/components/agent/agent-inbox-types";
import {
  isTestEvent,
  mergedItems,
  previewText,
  reviewItems,
} from "@/components/agent/agent-inbox-helpers";
import {
  agentEventReasonLine,
  agentEventStatusLabelForUi,
  agentReasonMessage,
  formatRelativeKo,
  formatSmsPreviewLabel,
  unassignedNote,
} from "@/lib/agent/event-status";

export function AgentInboxEventCard({
  event,
  tone,
  label,
  trips,
  suggestions,
  rowError,
  footer,
}: {
  event: AgentEventRow;
  tone: string;
  label: string;
  trips: TripOption[];
  suggestions: Record<string, Suggestion | null>;
  rowError?: string;
  footer: ReactNode;
}) {
  const reviews = reviewItems(event);
  const test = isTestEvent(event);
  const statusLabel = agentEventStatusLabelForUi({
    status: event.status,
    isTest: test,
  });
  const displayLabel = label || statusLabel;
  return (
    <article
      key={event.id}
      className={`rounded-2xl border p-3 ${tone} ${test ? "opacity-70" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-mu-card/80 px-2 py-0.5 text-xs font-bold tracking-wide text-mu-fg-2">
          {test ? "연결 테스트" : displayLabel}
        </span>
        <time
          className="text-xs text-mu-fg-2"
          dateTime={event.created_at}
          title={new Date(event.created_at).toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul",
          })}
        >
          {formatRelativeKo(event.created_at)}
          {" · "}
          {new Date(event.created_at).toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
      {event.status === "unassigned" ? (
        <p className="mt-2 text-xs leading-relaxed text-mu-warn">
          {
            unassignedNote({
              hasTrips: trips.length > 0,
              reason: event.result?.reason,
              suggest: suggestions[event.id] ?? null,
            }).message
          }
        </p>
      ) : null}
      {event.status === "failed" && !test ? (
        <p role="status" className="mt-2 text-xs leading-relaxed text-mu-err">
          {agentEventReasonLine({
            status: event.status,
            reason: event.result?.reason,
            error: event.error,
          })}
        </p>
      ) : null}
      <p className="mt-2 text-sm font-semibold text-mu-fg">{previewText(event)}</p>
      {event.result?.preview
        ? (() => {
            const previewLabel = formatSmsPreviewLabel(event.result.preview!);
            return previewLabel ? (
              <p className="mt-1 text-xs font-semibold text-mu-accent">
                {previewLabel}
              </p>
            ) : null;
          })()
        : null}
      {rowError ? (
        <p role="alert" className="mt-1 text-xs text-mu-err">
          {rowError}
        </p>
      ) : null}
      {reviews.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-mu-fg-2">
          {reviews.map((it) => (
            <li key={`${event.id}-r-${it.ref}`}>
              {agentReasonMessage(it.reasonCode) ||
                (it.reasons ?? []).join(" · ") ||
                `${it.draft?.merchant ?? "항목"} 확인이 필요해요`}
            </li>
          ))}
        </ul>
      ) : null}
      {mergedItems(event).length > 0 ? (
        <p className="mt-2 text-xs font-semibold text-mu-ok">
          이미 있는 지출에 영수증을 붙였어요
        </p>
      ) : null}
      {footer}
    </article>
  );
}