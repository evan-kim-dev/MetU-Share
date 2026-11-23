import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { MapPoint } from "@/lib/map/trip-points";
import type { Trip, TripDaySchedule } from "@/lib/trips/types";

export type TripDetailScheduleSectionProps = {
  trip: Trip;
  canEdit: boolean;
  isGuest: boolean;
  detailTab: "summary" | "schedule";
  spendByPlaceId?: Record<string, number>;
  mapHighlightKey?: string;
  onSelectMapPoint: (point: MapPoint) => void;
  scheduleItemRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  reorderMode: boolean;
  setReorderMode: Dispatch<SetStateAction<boolean>>;
  reorderError: string;
  setReorderError: (v: string) => void;
  cancelDayEdit: () => void;
  updateTripSchedule: (next: TripDaySchedule[]) => void;
  applyScheduleReorder: (
    from: { day: number; index: number },
    to: { day: number; index: number }
  ) => Promise<boolean>;
  editingDayIndex: number | null;
  draftDay: TripDaySchedule | null;
  openDayEdit: (dayIndex: number) => void;
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
  saveDayEdit: (dayIndex: number) => void;
};