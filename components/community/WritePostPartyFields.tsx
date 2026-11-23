"use client";

import { CalendarDays } from "lucide-react";
import { DateField } from "@/components/ui/DateField";
import type { Trip } from "@/lib/trips/types";
import { digitsOnly } from "@/components/community/write-post-sheet.utils";

interface WritePostPartyFieldsProps {
  todayIso: string;
  startDate: string;
  endDate: string;
  needed: number;
  budgetPerPerson: string;
  tripPickerOpen: boolean;
  sharedTripId: string | null;
  shareableTrips: Trip[];
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onNeededChange: (value: number) => void;
  onBudgetPerPersonChange: (value: string) => void;
  onToggleTripPicker: () => void;
  onApplySharedTrip: (trip: Trip) => void;
}

export function WritePostPartyFields({
  todayIso,
  startDate,
  endDate,
  needed,
  budgetPerPerson,
  tripPickerOpen,
  sharedTripId,
  shareableTrips,
  onStartDateChange,
  onEndDateChange,
  onNeededChange,
  onBudgetPerPersonChange,
  onToggleTripPicker,
  onApplySharedTrip,
}: WritePostPartyFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-ink-caption">출발일</span>
          <DateField
            aria-label="출발일"
            value={startDate}
            min={todayIso}
            onChange={(next) => {
              onStartDateChange(next);
              if (endDate && next && endDate < next) onEndDateChange("");
            }}
            className="h-11 rounded-lg border border-line-soft px-3 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-ink-caption">귀국일</span>
          <DateField
            aria-label="귀국일"
            value={endDate}
            min={startDate || todayIso}
            onChange={onEndDateChange}
            className="h-11 rounded-lg border border-line-soft px-3 text-sm outline-none focus:border-brand"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-ink-caption">모집 인원</span>
          <input
            type="number"
            min={2}
            max={20}
            value={needed}
            onChange={(e) =>
              onNeededChange(Math.max(2, Math.min(20, Number(e.target.value) || 2)))
            }
            className="h-11 rounded-lg border border-line-soft px-3 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-ink-caption">
            1인 예산 (만원, 선택)
          </span>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={budgetPerPerson}
            onChange={(e) => onBudgetPerPersonChange(digitsOnly(e.target.value))}
            placeholder="예: 80"
            className="h-11 rounded-lg border border-line-soft px-3 text-sm outline-none focus:border-brand"
          />
        </label>
      </div>

      <div className="rounded-xl border border-line-soft bg-surface-soft/60 p-3">
        <button
          type="button"
          onClick={onToggleTripPicker}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          일정 공유
          {sharedTripId ? (
            <span className="font-medium text-ink-caption">· 선택됨</span>
          ) : null}
        </button>

        {tripPickerOpen ? (
          <div className="mt-2 flex flex-col gap-1.5">
            {shareableTrips.length === 0 ? (
              <p className="text-xs leading-5 text-ink-caption">
                공유할 여행이 없어요. 먼저 여행을 만들어 주세요.
              </p>
            ) : (
              shareableTrips.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => onApplySharedTrip(trip)}
                  className={[
                    "rounded-lg border px-3 py-2.5 text-left transition-colors active:scale-[0.99]",
                    sharedTripId === trip.id
                      ? "border-brand bg-brand/5"
                      : "border-line-soft bg-surface-white",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold text-ink-heading">
                    {trip.destination}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-caption">
                    {trip.dateRange} · {trip.people}명
                  </p>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}