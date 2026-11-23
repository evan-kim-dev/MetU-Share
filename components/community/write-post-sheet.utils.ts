import type { Trip } from "@/lib/trips/types";

export function defaultDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function buildScheduleShareText(trip: Trip): string {
  if (!trip.dailySchedule?.length) {
    return `${trip.destination} 일정을 함께해요. (${trip.dateRange})`;
  }

  const days = trip.dailySchedule
    .map((day) => {
      const items = day.items
        .map((item) =>
          item.detail
            ? `· ${item.time} ${item.title}\n  ${item.detail}`
            : `· ${item.time} ${item.title}`
        )
        .join("\n");
      return `${day.label}\n${items}`;
    })
    .join("\n\n");

  return `${trip.destination} 일정을 공유해요.\n\n${days}`;
}