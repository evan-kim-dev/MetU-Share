"use client";

import { CalendarDays } from "lucide-react";
import { ItineraryChatBar } from "@/components/trips/ItineraryChatBar";
import { TripMapPanel } from "@/components/trips/TripMapPanel";
import { TripDetailScheduleDayEdit } from "@/components/trips/detail/TripDetailScheduleDayEdit";
import { TripDetailScheduleDayView } from "@/components/trips/detail/TripDetailScheduleDayView";
import { SortableDayList } from "@/components/trips/detail/TripDetailScheduleSortable";
import type { TripDetailScheduleSectionProps } from "@/components/trips/detail/trip-detail-schedule.types";

export type { TripDetailScheduleSectionProps } from "@/components/trips/detail/trip-detail-schedule.types";

export function TripDetailScheduleSection(props: TripDetailScheduleSectionProps) {
  const {
    trip,
    canEdit,
    detailTab,
    spendByPlaceId,
    mapHighlightKey,
    onSelectMapPoint,
    scheduleItemRefs,
    reorderMode,
    setReorderMode,
    reorderError,
    setReorderError,
    cancelDayEdit,
    updateTripSchedule,
    applyScheduleReorder,
    editingDayIndex,
    draftDay,
    openDayEdit,
    updateDraftItem,
    sortDraftDayByTime,
    removeDraftItem,
    addDraftItem,
    saveDayEdit,
  } = props;

  return (
    <>
      {detailTab === "schedule" &&
      trip.dailySchedule &&
      trip.dailySchedule.length > 0 ? (
        <TripMapPanel
          days={trip.dailySchedule}
          country={trip.country}
          destination={trip.destination}
          spendByPlaceId={spendByPlaceId}
          highlightKey={mapHighlightKey}
          onSelectPoint={onSelectMapPoint}
        />
      ) : null}

      {/* AI 일정표 */}
      {detailTab === "schedule" &&
      trip.dailySchedule &&
      trip.dailySchedule.length > 0 ? (
        <section className="rounded-2xl border-0 bg-surface-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand" />
              <h3 className="text-lg font-extrabold text-ink-heading">일정표</h3>
            </div>
            {canEdit ? (
              <button
                type="button"
                onClick={() => {
                  setReorderMode((v) => !v);
                  setReorderError("");
                  cancelDayEdit();
                }}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  reorderMode
                    ? "bg-brand text-white"
                    : "bg-surface-soft text-ink-body"
                }`}
              >
                {reorderMode ? "순서 바꾸기 종료" : "순서 바꾸기"}
              </button>
            ) : null}
          </div>

          {reorderError ? (
            <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">
              {reorderError}
            </p>
          ) : null}

          {canEdit && !reorderMode && trip.dailySchedule ? (
            <ItineraryChatBar
              city={trip.destination}
              country={trip.country}
              styles={trip.styles}
              nights={Math.max(1, trip.dailySchedule.length - 1)}
              dailySchedule={trip.dailySchedule}
              onScheduleChange={(next) => updateTripSchedule(next)}
            />
          ) : null}

          {reorderMode ? (
            <SortableDayList
              days={trip.dailySchedule ?? []}
              onReorder={(from, to) => {
                void (async () => {
                  const ok = await applyScheduleReorder(from, to);
                  if (!ok) {
                    setReorderError("순서를 바꾸지 못했어요.");
                  } else {
                    setReorderError("");
                  }
                })();
              }}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {(trip.dailySchedule ?? []).map((day, dayIndex) => {
                const isEditing = editingDayIndex === dayIndex && draftDay;

                return (
                  <div
                    key={day.day}
                    className="rounded-2xl border-0 bg-surface-soft shadow-sm p-4"
                  >
                    {isEditing && draftDay ? (
                      <TripDetailScheduleDayEdit
                        draftDay={draftDay}
                        updateDraftItem={updateDraftItem}
                        sortDraftDayByTime={sortDraftDayByTime}
                        removeDraftItem={removeDraftItem}
                        addDraftItem={addDraftItem}
                        cancelDayEdit={cancelDayEdit}
                        saveDayEdit={saveDayEdit}
                        dayIndex={dayIndex}
                      />
                    ) : (
                      <TripDetailScheduleDayView
                        day={day}
                        dayIndex={dayIndex}
                        canEdit={canEdit}
                        mapHighlightKey={mapHighlightKey}
                        scheduleItemRefs={scheduleItemRefs}
                        openDayEdit={openDayEdit}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}