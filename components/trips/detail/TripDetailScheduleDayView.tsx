"use client";

import type { MutableRefObject } from "react";
import { Pencil } from "lucide-react";
import { TripIconButton } from "@/components/trips/TripDetailParts";
import { formatKRW } from "@/lib/shared/format";
import type { TripDaySchedule } from "@/lib/trips/types";

export function TripDetailScheduleDayView({
  day,
  dayIndex,
  canEdit,
  mapHighlightKey,
  scheduleItemRefs,
  openDayEdit,
}: {
  day: TripDaySchedule;
  dayIndex: number;
  canEdit: boolean;
  mapHighlightKey?: string;
  scheduleItemRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  openDayEdit: (dayIndex: number) => void;
}) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-extrabold text-brand">{day.day}일차</span>
        {canEdit ? (
          <TripIconButton
            label={`${day.day}일차 일정 수정`}
            onClick={() => openDayEdit(dayIndex)}
          >
            <Pencil className="h-4 w-4" strokeWidth={2.2} />
          </TripIconButton>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        {day.items.map((item, itemIndex) => {
          const pointKey = `${day.day}-${itemIndex}`;
          const highlighted = mapHighlightKey === pointKey;
          return (
            <div
              key={pointKey}
              ref={(el) => {
                scheduleItemRefs.current[pointKey] = el;
              }}
              className={`flex items-start justify-between gap-3 rounded-lg px-1 py-1 transition ${
                highlighted ? "ring-2 ring-brand bg-brand/5" : ""
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-ink-caption">
                  {item.time}
                </p>
                <p className="text-sm font-bold text-ink-heading">{item.title}</p>
                {item.detail ? (
                  <p className="mt-0.5 text-sm leading-snug text-ink-body">
                    {item.detail}
                  </p>
                ) : null}
                {typeof item.travelFromPrevMin === "number" &&
                item.travelFromPrevMin > 0 ? (
                  <p className="mt-0.5 text-[11px] font-semibold text-brand">
                    이동 {item.travelFromPrevMin}분
                  </p>
                ) : null}
                {item.hoursKnown === false ? (
                  <p className="mt-0.5 text-[11px] text-ink-caption">
                    영업시간 확인 필요
                    {item.detailUrl ? (
                      <>
                        {" · "}
                        <a
                          href={item.detailUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          지도에서 보기
                        </a>
                      </>
                    ) : null}
                  </p>
                ) : null}
                {item.warnings?.includes("closed") ? (
                  <p className="mt-0.5 text-[11px] font-semibold text-danger">
                    영업시간 확인 필요
                  </p>
                ) : null}
              </div>
              {item.cost > 0 ? (
                <span className="shrink-0 text-xs font-bold text-ink-heading">
                  {formatKRW(item.cost)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-3 border-t border-line-soft pt-2 text-right text-xs font-bold text-brand">
        일일 예상 {formatKRW(day.dayTotal)}
      </p>
    </>
  );
}