"use client";

import { CostPill, DayTab } from "@/components/ds";
import { formatKRW } from "@/lib/shared/format";
import type { TripDaySchedule } from "@/lib/trips/types";

export function RecommendResultSchedule({
  dayTabs,
  selectedDay,
  onSelectDay,
  activeDay,
  enriching,
  routeOptimizing,
}: {
  dayTabs: Array<{ key: string; label: string }>;
  selectedDay: string;
  onSelectDay: (day: string) => void;
  activeDay: TripDaySchedule | undefined;
  enriching: boolean;
  routeOptimizing: boolean;
}) {
  return (
    <>
      {(enriching || routeOptimizing) && (
        <p className="text-mu-caption font-semibold text-mu-accent">
          {enriching ? "AI 다듬는 중…" : "동선 최적화 중…"}
        </p>
      )}

      {dayTabs.length > 0 ? (
        <DayTab
          items={dayTabs}
          value={selectedDay}
          onChange={onSelectDay}
          className="px-0"
        />
      ) : null}

      {activeDay ? (
        <ol className="relative flex flex-col gap-0 border-l-2 border-mu-line pl-4">
          {activeDay.items.map((item) => (
            <li
              key={`${activeDay.day}-${item.time}-${item.title}`}
              className="relative pb-5 last:pb-0"
            >
              <span
                className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-mu-accent"
                aria-hidden
              />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-mu-caption font-semibold text-mu-fg-3">
                    {item.time}
                  </p>
                  <p className="mt-0.5 text-mu-body font-semibold text-mu-fg">
                    {item.title}
                  </p>
                  {item.detail ? (
                    <p className="mt-0.5 text-mu-caption leading-snug text-mu-fg-2">
                      {item.detail}
                    </p>
                  ) : null}
                </div>
                <CostPill amount={item.cost} unknown={item.cost <= 0} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-mu-body text-mu-fg-3">일정이 아직 없어요.</p>
      )}

      {activeDay ? (
        <p className="text-right text-mu-caption font-semibold text-mu-accent">
          일일 예상 {formatKRW(activeDay.dayTotal)}
        </p>
      ) : null}
    </>
  );
}