"use client";

import type {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
} from "react";
import { AirportSearchField } from "@/components/onboarding/AirportSearchField";
import { formatPlaceDestination } from "@/lib/places/autocomplete";
import type { PlaceItem } from "@/lib/places/autocomplete";
import type { QuickTripPhase } from "@/components/trips/quick-trip-sheet.utils";

export function QuickTripSheetForm({
  subtitle,
  destId,
  startId,
  destErrorId,
  startErrorId,
  destRef,
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
  submitting,
  preview,
  closeIfIdle,
  onFormSubmit,
  onDestKeyDown,
  onRetry,
}: {
  subtitle: string;
  destId: string;
  startId: string;
  destErrorId: string;
  startErrorId: string;
  destRef: RefObject<HTMLInputElement | null>;
  destination: string;
  setDestination: (v: string) => void;
  setCountry: (v: string) => void;
  startIso: string;
  setStartIso: (v: string) => void;
  days: number;
  setDays: (updater: number | ((d: number) => number)) => void;
  phase: QuickTripPhase;
  destError: string;
  setDestError: (v: string) => void;
  startError: string;
  online: boolean;
  submitting: boolean;
  preview: string;
  closeIfIdle: () => void;
  onFormSubmit: (e: FormEvent) => void;
  onDestKeyDown: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
  onRetry: () => void;
}) {
  return (
    <>
      {phase === "error" ? (
        <div
          role="alert"
          className="mb-3 rounded-xl bg-mu-err/10 px-3 py-3 text-sm text-mu-err"
        >
          <p className="font-semibold">
            여행을 만들지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.
          </p>
          <button
            type="button"
            className="mt-2 inline-flex min-h-11 items-center font-bold text-mu-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
            onClick={onRetry}
          >
            다시 시도
          </button>
        </div>
      ) : null}

      <p className="mt-1 text-sm leading-relaxed text-mu-fg-2">{subtitle}</p>

      <form className="mt-4 flex flex-col gap-4" onSubmit={onFormSubmit}>
        <div className="flex flex-col gap-1.5">
          <AirportSearchField
            label="어디로 가나요?"
            placeholder="예: 도쿄"
            value={destination}
            inputId={destId}
            inputRef={destRef}
            placesMode="cities"
            maxLength={40}
            disabled={submitting}
            aria-invalid={destError ? true : undefined}
            aria-describedby={destError ? destErrorId : undefined}
            formatValue={formatPlaceDestination}
            onChange={(next) => {
              setDestination(next);
              setCountry("");
              if (next.trim()) setDestError("");
            }}
            onSelectPlace={(place: PlaceItem) => {
              const countryName =
                place.type === "country"
                  ? place.name
                  : (place.countryName ?? "");
              setCountry(countryName);
            }}
            onInputKeyDown={onDestKeyDown}
          />
          {destError ? (
            <p
              id={destErrorId}
              role="alert"
              className="text-sm font-semibold text-mu-err"
            >
              {destError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={startId} className="text-sm font-bold text-mu-fg">
            출발일
          </label>
          <input
            id={startId}
            type="date"
            value={startIso}
            disabled={submitting}
            aria-invalid={startError ? true : undefined}
            aria-describedby={startError ? startErrorId : `${startId}-hint`}
            onChange={(e) => setStartIso(e.target.value)}
            className="h-12 w-full rounded-xl border border-mu-line bg-mu-card px-3 text-base text-mu-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent disabled:opacity-60"
          />
          <p id={`${startId}-hint`} className="text-xs text-mu-fg-2">
            이미 떠났다면 오늘 날짜 그대로 두세요.
          </p>
          {startError ? (
            <p
              id={startErrorId}
              role="alert"
              className="text-sm font-semibold text-mu-err"
            >
              {startError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-mu-fg">며칠 여행인가요?</span>
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="하루 줄이기"
              disabled={submitting || days <= 1}
              onClick={() => setDays((d) => Math.max(1, d - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-mu-sunken text-lg font-bold text-mu-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent disabled:opacity-40"
            >
              −
            </button>
            <span aria-live="polite" className="text-base font-bold">
              {days}일
            </span>
            <button
              type="button"
              aria-label="하루 늘리기"
              disabled={submitting || days >= 30}
              onClick={() => setDays((d) => Math.min(30, d + 1))}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-mu-sunken text-lg font-bold text-mu-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent disabled:opacity-40"
            >
              ＋
            </button>
          </div>
        </div>

        {preview ? (
          <p
            aria-live="polite"
            className="rounded-xl bg-mu-sunken px-3 py-2 text-sm font-semibold text-mu-fg-2"
          >
            {preview}
          </p>
        ) : null}

        {!online ? (
          <p role="status" className="text-sm font-semibold text-mu-fg-2">
            인터넷에 연결되면 만들 수 있어요.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || !online}
          aria-busy={submitting || undefined}
          className="bg-mu-accent flex min-h-touch w-full items-center justify-center rounded-2xl text-base font-bold text-mu-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent disabled:bg-none disabled:bg-mu-sunken disabled:opacity-70"
        >
          {submitting ? "만드는 중…" : "여행 만들기"}
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={closeIfIdle}
          className="inline-flex min-h-11 items-center justify-center text-sm font-bold text-mu-fg-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent disabled:opacity-50"
        >
          닫기
        </button>
      </form>
    </>
  );
}
