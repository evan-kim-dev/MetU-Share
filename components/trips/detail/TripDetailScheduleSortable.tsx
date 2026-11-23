"use client";

import dynamic from "next/dynamic";
import type { TripDaySchedule } from "@/lib/trips/types";

export const SortableDayList = dynamic(
  () =>
    import("@/components/trips/SortableDayList").then((m) => m.SortableDayList),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-32 w-full animate-pulse rounded-2xl bg-surface-soft"
        aria-hidden
      />
    ),
  }
);

export type SortableDayListProps = {
  days: TripDaySchedule[];
  onReorder: (
    from: { day: number; index: number },
    to: { day: number; index: number }
  ) => void;
};