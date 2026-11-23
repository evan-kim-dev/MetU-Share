export function AgentInboxToolbar({
  unassignedCount,
  filterUnassigned,
  onToggleFilter,
  noTrips,
  onOpenTripSheet,
  error,
  reloadBusy,
  onReload,
  offlineHint,
  hasEvents,
}: {
  unassignedCount: number;
  filterUnassigned: boolean;
  onToggleFilter: () => void;
  noTrips: boolean;
  onOpenTripSheet: () => void;
  error: string;
  reloadBusy: boolean;
  onReload: () => void;
  offlineHint: boolean;
  hasEvents: boolean;
}) {
  return (
    <>
      {unassignedCount > 0 ? (
        <button
          type="button"
          aria-pressed={filterUnassigned}
          className={`min-h-11 rounded-xl px-3 py-2 text-left text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent ${
            filterUnassigned
              ? "bg-mu-accent text-mu-on-accent"
              : "bg-mu-warn-soft text-mu-warn ring-1 ring-mu-warn/30"
          }`}
          onClick={onToggleFilter}
        >
          {filterUnassigned
            ? "전체 보기"
            : `여행 없는 알림 ${unassignedCount}건만 보기`}
        </button>
      ) : null}

      {noTrips && unassignedCount > 0 ? (
        <section className="rounded-2xl bg-mu-warn-soft px-4 py-3 ring-1 ring-mu-warn/30">
          <p className="text-sm font-extrabold text-mu-warn">
            여행이 없어서 알림 {unassignedCount}건을 보관 중이에요
          </p>
          <p className="mt-1 text-sm text-mu-warn">
            여행을 만들면 기간이 맞는 알림이 자동으로 붙어요.
          </p>
          <button
            type="button"
            className="mt-2 inline-flex min-h-11 items-center rounded-xl bg-mu-card px-3 text-sm font-bold text-mu-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
            onClick={onOpenTripSheet}
          >
            여행 만들기
          </button>
        </section>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-lg bg-mu-err-soft px-3 py-3 text-sm font-semibold text-mu-err"
        >
          <p>{error}</p>
          <button
            type="button"
            disabled={reloadBusy}
            aria-busy={reloadBusy || undefined}
            className="mt-2 inline-flex min-h-11 items-center font-bold text-mu-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent disabled:opacity-60"
            onClick={onReload}
          >
            {reloadBusy ? "불러오는 중…" : "다시 불러오기"}
          </button>
        </div>
      ) : null}

      {offlineHint && !hasEvents ? (
        <p role="status" className="text-sm text-mu-fg-2">
          인터넷 연결을 확인해 주세요.
        </p>
      ) : null}
    </>
  );
}
