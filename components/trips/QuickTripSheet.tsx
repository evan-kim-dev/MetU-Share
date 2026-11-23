"use client";

import { QuickTripSheetForm } from "@/components/trips/QuickTripSheetForm";
import {
  QUICK_TRIP_SUBTITLE,
  type QuickTripSheetReason,
} from "@/components/trips/quick-trip-sheet.utils";
import { useQuickTripSheet } from "@/components/trips/useQuickTripSheet";
import type { Trip } from "@/lib/trips/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (trip: Trip) => void;
  reason?: QuickTripSheetReason;
};

export function QuickTripSheet({
  open,
  onClose,
  onCreated,
  reason = "first-run",
}: Props) {
  const {
    titleId,
    destId,
    startId,
    destErrorId,
    startErrorId,
    destRef,
    panelRef,
    destination,
    setDestination,
    setCountry,
    startIso,
    setStartIso,
    days,
    setDays,
    phase,
    destError,
    setDestError,
    startError,
    online,
    toast,
    submitting,
    closeIfIdle,
    preview,
    submit,
    onFormSubmit,
    onDestKeyDown,
  } = useQuickTripSheet({ open, onClose, onCreated });

  return (
    <>
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] mx-auto w-[min(100%,440px)] px-4"
        >
          <p className="rounded-2xl bg-ink-heading px-4 py-3 text-sm font-semibold text-mu-on-accent shadow-soft">
            여행을 만들었어요. 알림이 오면 기간에 맞춰 이 여행에 모아요.
          </p>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 bg-black/40"
            disabled={submitting}
            onClick={closeIfIdle}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex w-full max-w-mobile max-h-[88dvh] flex-col overflow-y-auto rounded-t-3xl bg-mu-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-soft"
          >
            <h2 id={titleId} className="text-lg font-extrabold text-mu-fg">
              빠르게 여행 만들기
            </h2>
            <QuickTripSheetForm
              subtitle={QUICK_TRIP_SUBTITLE[reason]}
              destId={destId}
              startId={startId}
              destErrorId={destErrorId}
              startErrorId={startErrorId}
              destRef={destRef}
              destination={destination}
              setDestination={setDestination}
              setCountry={setCountry}
              startIso={startIso}
              setStartIso={setStartIso}
              days={days}
              setDays={setDays}
              phase={phase}
              destError={destError}
              setDestError={setDestError}
              startError={startError}
              online={online}
              submitting={submitting}
              preview={preview}
              closeIfIdle={closeIfIdle}
              onFormSubmit={onFormSubmit}
              onDestKeyDown={onDestKeyDown}
              onRetry={() => void submit()}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
