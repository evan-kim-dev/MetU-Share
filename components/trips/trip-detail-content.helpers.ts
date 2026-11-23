export function nextScheduleLineFromTrip(trip: {
  dailySchedule?: Array<{
    dayLabel?: string;
    items?: Array<{ title?: string; placeName?: string }>;
  }>;
}): string | null {
  const days = trip.dailySchedule ?? [];
  for (const day of days) {
    const item = day.items?.[0];
    if (!item) continue;
    const place = item.placeName?.trim() || item.title?.trim();
    if (!place) continue;
    const dayLabel = day.dayLabel?.trim();
    return dayLabel ? `${dayLabel} · ${place}` : place;
  }
  return null;
}