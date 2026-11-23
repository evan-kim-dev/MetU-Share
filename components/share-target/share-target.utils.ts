import { suggestTripDates } from "@/lib/ledger/trip-dates";
import type { Trip } from "@/lib/trips/types";

export type PendingShare = {
  inboxId?: string;
  text: string;
  file: File | null;
};

export function pickPreferredTrip(trips: Trip[]): Trip | null {
  const today = new Date().toISOString().slice(0, 10);
  const active = trips.filter((t) => t.status !== "completed");
  for (const trip of active) {
    const range = suggestTripDates(trip.dateRange, today);
    if (range && today >= range.startDate && today <= range.endDate) {
      return trip;
    }
  }
  if (active.length === 1) return active[0] ?? null;
  const ongoing = active.find((t) => t.status === "ongoing");
  return ongoing ?? active[0] ?? null;
}
