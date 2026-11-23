"use client";

import { Plus } from "lucide-react";
import { TripBotSheet } from "@/components/trips/TripBotSheet";
import {
  TripIntentSheet,
  type TripIntent,
} from "@/components/trips/TripIntentSheet";

export function TripDetailIntentFab({
  tripId,
  intentOpen,
  setIntentOpen,
  botOpen,
  setBotOpen,
  onSelectIntent,
}: {
  tripId: string;
  intentOpen: boolean;
  setIntentOpen: (open: boolean) => void;
  botOpen: boolean;
  setBotOpen: (open: boolean) => void;
  onSelectIntent: (intent: TripIntent) => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="추가"
        onClick={() => setIntentOpen(true)}
        className="mu-focus fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-[max(1rem,calc(50%-11rem))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-mu-accent text-mu-on-accent shadow-mu-float"
      >
        <Plus className="h-6 w-6" strokeWidth={2.2} aria-hidden />
      </button>
      <TripIntentSheet
        open={intentOpen}
        onClose={() => setIntentOpen(false)}
        onSelect={onSelectIntent}
      />
      <TripBotSheet
        tripId={tripId}
        open={botOpen}
        onClose={() => setBotOpen(false)}
      />
    </>
  );
}