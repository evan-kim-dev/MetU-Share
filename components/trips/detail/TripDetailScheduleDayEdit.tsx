"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { formatKRW } from "@/lib/shared/format";
import type { TripDaySchedule } from "@/lib/trips/types";

export function TripDetailScheduleDayEdit({
  draftDay,
  updateDraftItem,
  sortDraftDayByTime,
  removeDraftItem,
  addDraftItem,
  cancelDayEdit,
  saveDayEdit,
  dayIndex,
}: {
  draftDay: TripDaySchedule;
  updateDraftItem: (
    itemIndex: number,
    patch: Partial<{
      time: string;
      title: string;
      detail: string;
      cost: string;
    }>
  ) => void;
  sortDraftDayByTime: () => void;
  removeDraftItem: (itemIndex: number) => void;
  addDraftItem: () => void;
  cancelDayEdit: () => void;
  saveDayEdit: (dayIndex: number) => void;
  dayIndex: number;
}) {
  return (
    <>
      <div className="mb-3">
        <span className="text-sm font-extrabold text-brand">
          {draftDay.day}일차
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {draftDay.items.map((item, itemIndex) => (
          <div
            key={`edit-${draftDay.day}-${itemIndex}`}
            className="rounded-lg border border-line-soft bg-surface-white p-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <input
                value={item.time}
                onChange={(e) =>
                  updateDraftItem(itemIndex, {
                    time: e.target.value,
                  })
                }
                onBlur={sortDraftDayByTime}
                placeholder="14:00"
                className="h-9 w-20 rounded-lg border border-line-muted px-2 text-xs font-semibold text-ink-caption focus:border-brand focus:outline-none"
              />
              <input
                inputMode="numeric"
                value={item.cost > 0 ? String(item.cost) : ""}
                onChange={(e) =>
                  updateDraftItem(itemIndex, {
                    cost: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                placeholder="금액"
                className="h-9 min-w-0 flex-1 rounded-lg border border-line-muted px-2 text-xs font-bold text-ink-heading focus:border-brand focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeDraftItem(itemIndex)}
                aria-label="일정 항목 삭제"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-danger active:bg-danger/10"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
            <input
              value={item.title}
              onChange={(e) =>
                updateDraftItem(itemIndex, {
                  title: e.target.value,
                })
              }
              placeholder="소제목 예: 지하철 → 오테마치역"
              className="h-9 w-full rounded-lg border border-line-muted px-2.5 text-sm font-semibold text-ink-heading focus:border-brand focus:outline-none"
            />
            <input
              value={item.detail ?? ""}
              onChange={(e) =>
                updateDraftItem(itemIndex, {
                  detail: e.target.value,
                })
              }
              placeholder="내용 예: 역에서 황거동 어원 입구로 이동"
              className="mt-2 h-9 w-full rounded-lg border border-line-muted px-2.5 text-sm text-ink-body focus:border-brand focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addDraftItem}
        className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
        일정 추가
      </button>

      <p className="mt-3 border-t border-line-soft pt-2 text-right text-xs font-bold text-brand">
        일일 예상 {formatKRW(draftDay.dayTotal)}
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={cancelDayEdit}
          className="flex-1 rounded-xl border border-line-muted py-2.5 text-sm font-bold text-ink-body"
        >
          취소
        </button>
        <button
          type="button"
          onClick={() => saveDayEdit(dayIndex)}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-brand py-2.5 text-sm font-bold text-surface-white"
        >
          <Check className="h-4 w-4" />
          저장
        </button>
      </div>
    </>
  );
}