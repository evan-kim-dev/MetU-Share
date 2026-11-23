import type { ReactNode } from "react";
import { AgentInboxEmpty } from "@/components/agent/AgentInboxEmpty";
import { AgentInboxEventCard } from "@/components/agent/AgentInboxEventCard";
import {
  autoItems,
  mergedItems,
  reviewItems,
} from "@/components/agent/agent-inbox-helpers";
import type {
  AgentEventRow,
  BulkAttachState,
  Suggestion,
  TripOption,
} from "@/components/agent/agent-inbox-types";
import type {
  AgentInboxGroups,
  BulkGroup,
} from "@/components/agent/useAgentInbox";
import { formatKRW } from "@/lib/shared/format";

type ActiveTrip = {
  id: string;
  destination: string;
};

export function AgentInboxList({
  loading,
  error,
  groups,
  bulkGroups,
  bulk,
  trips,
  activeTrips,
  suggestions,
  rowErrors,
  busyId,
  ignoredOpen,
  connectHref,
  connected,
  onToggleIgnored,
  onAttachAll,
  onOpenTripSheet,
  onOpenEdit,
  post,
  withBusy,
}: {
  loading: boolean;
  error: string;
  groups: AgentInboxGroups;
  bulkGroups: BulkGroup[];
  bulk: BulkAttachState | null;
  trips: TripOption[];
  activeTrips: ActiveTrip[];
  suggestions: Record<string, Suggestion | null>;
  rowErrors: Record<string, string>;
  busyId: string | null;
  ignoredOpen: boolean;
  connectHref: string;
  connected: boolean;
  onToggleIgnored: () => void;
  onAttachAll: (tripId: string, ids: string[]) => void;
  onOpenTripSheet: () => void;
  onOpenEdit: (event: AgentEventRow) => void;
  post: (path: string, body?: unknown) => Promise<void>;
  withBusy: (id: string, fn: () => Promise<void>) => Promise<void>;
}) {
  function renderAssign(event: AgentEventRow) {
    if (event.status !== "unassigned" && event.trip_id != null) return null;
    if (trips.length === 0) {
      // 안내 문구("여행을 만들면 자동으로 붙어요")는 카드 상단 note 에 있다.
      return (
        <button
          type="button"
          className="mt-2 inline-flex min-h-11 items-center rounded-lg bg-mu-accent px-3 text-xs font-bold text-mu-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
          onClick={onOpenTripSheet}
        >
          여행 만들기
        </button>
      );
    }
    const suggestion = suggestions[event.id] ?? null;
    const suggestName =
      suggestion?.destination?.trim() ||
      activeTrips.find((t) => t.id === suggestion?.tripId)?.destination ||
      "이 여행";
    return (
      <>
        {suggestion ? (
          <button
            type="button"
            disabled={busyId === event.id || bulk?.running === true}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-mu-accent px-3 py-2 text-sm font-bold text-mu-on-accent disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
            onClick={() =>
              void withBusy(event.id, () =>
                post(`/api/agent/events/${event.id}/assign`, {
                  tripId: suggestion.tripId,
                })
              )
            }
          >
            {suggestName} 여행에 붙이기
          </button>
        ) : null}
        <label className="mt-2 flex flex-col gap-1 text-xs">
          <span className="font-bold text-mu-fg">
            {suggestion ? "다른 여행에 배정" : "여행에 배정"}
          </span>
          <select
            className="min-h-11 rounded-lg border border-mu-line px-3 py-2 text-sm"
            defaultValue=""
            disabled={busyId === event.id}
            onChange={(e) => {
              const next = e.target.value;
              if (!next) return;
              void withBusy(event.id, () =>
                post(`/api/agent/events/${event.id}/assign`, {
                  tripId: next === "__none__" ? null : next,
                })
              );
            }}
          >
            <option value="" disabled>
              여행 선택
            </option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
            {event.trip_id != null ? (
              <option value="__none__">미할당으로 되돌리기</option>
            ) : null}
          </select>
        </label>
      </>
    );
  }

  function renderManageButtons(event: AgentEventRow) {
    const disabled = busyId === event.id;
    if (event.status === "processing") return null;
    const hasLinkedExpense =
      event.status === "auto" ||
      event.status === "done" ||
      autoItems(event).length > 0 ||
      mergedItems(event).length > 0;
    return (
      <>
        <button
          type="button"
          disabled={disabled}
          className="min-h-11 rounded-lg border border-mu-line px-3 py-1.5 text-xs font-bold text-mu-fg-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
          onClick={() => onOpenEdit(event)}
        >
          수정
        </button>
        <button
          type="button"
          disabled={disabled}
          className="min-h-11 rounded-lg border border-mu-err/40 px-3 py-1.5 text-xs font-bold text-mu-err disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
          onClick={() => {
            const msg = hasLinkedExpense
              ? "확인함에서만 지울까요? 이미 가계부에 들어간 지출은 그대로 남아요."
              : "이 알림을 확인함에서 완전히 삭제할까요? (「나중에」와 달리 되돌릴 수 없어요)";
            if (typeof window !== "undefined" && !window.confirm(msg)) {
              return;
            }
            void withBusy(event.id, () =>
              post(`/api/agent/events/${event.id}/delete`)
            );
          }}
        >
          삭제
        </button>
      </>
    );
  }

  function renderActions(event: AgentEventRow) {
    const disabled = busyId === event.id;
    if (event.status === "unassigned") {
      return (
        <div className="mt-2 flex flex-col gap-2">
          {renderAssign(event)}
          <div className="flex flex-wrap gap-2">{renderManageButtons(event)}</div>
        </div>
      );
    }
    if (event.status === "needs_review") {
      const reviews = reviewItems(event);
      const canMerge = reviews.some((it) => it.mergeInto);
      const billedMerge = reviews.some((it) => it.mergeKind === "billed_krw");
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          {canMerge ? (
            <button
              type="button"
              disabled={disabled}
              className="min-h-11 rounded-lg bg-mu-accent px-3 py-1.5 text-xs font-bold text-mu-on-accent disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
              onClick={() =>
                void withBusy(event.id, () =>
                  post(`/api/agent/events/${event.id}/confirm`, {
                    mode: "merge",
                  })
                )
              }
            >
              {billedMerge ? "같은 결제로 청구액 합치기" : "기존 지출에 합치기"}
            </button>
          ) : null}
          <button
            type="button"
            disabled={disabled}
            className={`min-h-11 rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent ${
              canMerge
                ? "bg-mu-sunken text-mu-fg-2"
                : "bg-mu-accent text-mu-on-accent"
            }`}
            onClick={() =>
              void withBusy(event.id, () =>
                post(`/api/agent/events/${event.id}/confirm`)
              )
            }
          >
            {canMerge ? "별개로 저장" : "가계부에 추가"}
          </button>
          <button
            type="button"
            disabled={disabled}
            title="목록 아래로 접어 두고, 나중에 다시 볼 수 있어요"
            className="min-h-11 rounded-lg bg-mu-sunken px-3 py-1.5 text-xs font-bold text-mu-fg-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
            onClick={() =>
              void withBusy(event.id, () =>
                post(`/api/agent/events/${event.id}/dismiss`)
              )
            }
          >
            나중에
          </button>
          {renderManageButtons(event)}
        </div>
      );
    }
    if (event.status === "failed") {
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            className="min-h-11 rounded-lg bg-mu-accent px-3 py-1.5 text-xs font-bold text-mu-on-accent disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
            onClick={() =>
              void withBusy(event.id, () =>
                post(`/api/agent/events/${event.id}/retry`)
              )
            }
          >
            다시 처리
          </button>
          <button
            type="button"
            disabled={disabled}
            title="목록 아래로 접어 두고, 나중에 다시 볼 수 있어요"
            className="min-h-11 rounded-lg bg-mu-sunken px-3 py-1.5 text-xs font-bold text-mu-fg-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
            onClick={() =>
              void withBusy(event.id, () =>
                post(`/api/agent/events/${event.id}/dismiss`)
              )
            }
          >
            나중에
          </button>
          {renderManageButtons(event)}
        </div>
      );
    }
    if (
      event.status === "ignored" ||
      event.status === "received" ||
      event.status === "auto" ||
      event.status === "done"
    ) {
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          {renderManageButtons(event)}
        </div>
      );
    }
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {renderManageButtons(event)}
      </div>
    );
  }

  function renderAutoUndo(event: AgentEventRow) {
    const autos = autoItems(event);
    if (autos.length === 0) return null;
    return (
      <ul className="mt-2 space-y-1">
        {autos.map((it) => (
          <li
            key={`${event.id}-${it.ref}-${it.expenseId}`}
            className="flex items-center justify-between rounded-lg bg-mu-sunken px-2 py-1.5 text-xs"
          >
            <span className="text-mu-fg-2">
              {it.draft?.merchant ?? "지출"}{" "}
              {it.priced?.krwAmount != null
                ? formatKRW(it.priced.krwAmount)
                : it.draft?.amount != null
                  ? `${it.draft.amount} ${it.draft.currency ?? ""}`
                  : null}
            </span>
            <button
              type="button"
              disabled={busyId === it.expenseId}
              className="min-h-11 font-bold text-mu-accent disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
              onClick={() =>
                void withBusy(it.expenseId!, () =>
                  post(`/api/agent/expenses/${it.expenseId}/undo`)
                )
              }
            >
              실행 취소
            </button>
          </li>
        ))}
      </ul>
    );
  }

  function eventCardFooter(event: AgentEventRow): ReactNode {
    return (
      <>
        {renderAutoUndo(event)}
        {renderActions(event)}
      </>
    );
  }

  if (loading) {
    return (
      <div
        role="status"
        aria-label="불러오는 중"
        className="h-40 animate-pulse rounded-2xl bg-mu-sunken motion-reduce:animate-none"
      />
    );
  }

  return (
    <>
      {groups.unassignedCards.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-extrabold text-mu-fg">미할당</h2>
          {bulkGroups.map((g) => (
            <div
              key={g.tripId}
              className="rounded-2xl border border-mu-accent/20 bg-mu-accent-soft p-3"
            >
              <button
                type="button"
                disabled={bulk?.running === true}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-mu-accent px-3 py-2 text-sm font-bold text-mu-on-accent disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
                onClick={() => void onAttachAll(g.tripId, g.ids)}
              >
                {g.ids.length}건 모두 {g.name}에 붙이기
              </button>
              {bulk && bulk.tripId === g.tripId ? (
                bulk.running ? (
                  <p role="status" className="mt-2 text-xs text-mu-fg-2">
                    붙이는 중이에요 ({bulk.done}/{bulk.total})
                  </p>
                ) : bulk.failed > 0 ? (
                  <p
                    role="alert"
                    className="mt-2 text-xs font-semibold text-mu-err"
                  >
                    {bulk.total}건 중 {bulk.failed}건을 붙이지 못했어요. 다시
                    시도해 주세요.
                  </p>
                ) : (
                  <p
                    role="status"
                    className="mt-2 text-xs font-semibold text-mu-ok"
                  >
                    {bulk.total}건을 모두 붙였어요
                  </p>
                )
              ) : null}
            </div>
          ))}
          {groups.unassignedCards.map((e) => (
            <AgentInboxEventCard
              key={e.id}
              event={e}
              label="미할당"
              tone="border-mu-warn/30 bg-mu-warn-soft/80"
              trips={trips}
              suggestions={suggestions}
              rowError={rowErrors[e.id]}
              footer={eventCardFooter(e)}
            />
          ))}
        </section>
      ) : null}

      {groups.processing.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-extrabold text-mu-fg">처리 중</h2>
          {groups.processing.map((e) => (
            <AgentInboxEventCard
              key={e.id}
              event={e}
              label="처리 중"
              tone="border-mu-accent/20 bg-mu-accent-soft"
              trips={trips}
              suggestions={suggestions}
              rowError={rowErrors[e.id]}
              footer={eventCardFooter(e)}
            />
          ))}
        </section>
      ) : null}

      {groups.review.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-extrabold text-mu-fg">확인이 필요해요</h2>
          {groups.review.map((e) => (
            <AgentInboxEventCard
              key={e.id}
              event={e}
              label="확인이 필요해요"
              tone="border-mu-warn/30 bg-mu-warn-soft/80"
              trips={trips}
              suggestions={suggestions}
              rowError={rowErrors[e.id]}
              footer={eventCardFooter(e)}
            />
          ))}
        </section>
      ) : null}

      {groups.failed.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-extrabold text-mu-fg">실패</h2>
          {groups.failed.map((e) => (
            <AgentInboxEventCard
              key={e.id}
              event={e}
              label="실패"
              tone="border-mu-err/30 bg-mu-err-soft"
              trips={trips}
              suggestions={suggestions}
              rowError={rowErrors[e.id]}
              footer={eventCardFooter(e)}
            />
          ))}
        </section>
      ) : null}

      {groups.autoDone.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-extrabold text-mu-fg">자동 추가됨</h2>
          {groups.autoDone.map((e) => (
            <AgentInboxEventCard
              key={e.id}
              event={e}
              label="자동 추가"
              tone="border-mu-ok/30 bg-mu-ok-soft/60"
              trips={trips}
              suggestions={suggestions}
              rowError={rowErrors[e.id]}
              footer={eventCardFooter(e)}
            />
          ))}
        </section>
      ) : null}

      {groups.ignored.length > 0 ? (
        <section className="flex flex-col gap-2">
          <button
            type="button"
            className="flex min-h-11 items-center justify-between text-sm font-extrabold text-mu-fg-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
            onClick={onToggleIgnored}
          >
            <span>나중에 ({groups.ignored.length})</span>
            <span>{ignoredOpen ? "▲" : "▼"}</span>
          </button>
          {ignoredOpen
            ? groups.ignored.map((e) => (
                <AgentInboxEventCard
                  key={e.id}
                  event={e}
                  label="나중에"
                  tone="border-mu-line bg-mu-sunken/50 opacity-80"
                  trips={trips}
                  suggestions={suggestions}
                  rowError={rowErrors[e.id]}
                  footer={eventCardFooter(e)}
                />
              ))
            : null}
        </section>
      ) : null}

      {!error && groups.scoped.length === 0 ? (
        <AgentInboxEmpty connectHref={connectHref} connected={connected} />
      ) : null}
    </>
  );
}
