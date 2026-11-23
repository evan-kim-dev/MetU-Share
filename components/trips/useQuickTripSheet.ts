"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { seoulDateIso } from "@/lib/onboarding/trip-window";
import { addDays } from "@/lib/shared/dates";
import { buildQuickTrip } from "@/lib/trips/quick-trip";
import { useTrips } from "@/lib/trips/TripProvider";
import type { Trip } from "@/lib/trips/types";
import {
  formatMd,
  isValidIsoDate,
  type QuickTripPhase,
} from "@/components/trips/quick-trip-sheet.utils";

export function useQuickTripSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (trip: Trip) => void;
}) {
  const { addTrip } = useTrips();
  const titleId = useId();
  const destId = useId();
  const startId = useId();
  const destErrorId = useId();
  const startErrorId = useId();
  const destRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [startIso, setStartIso] = useState(() => seoulDateIso(new Date()));
  const [days, setDays] = useState(5);
  const [phase, setPhase] = useState<QuickTripPhase>("idle");
  const [destError, setDestError] = useState("");
  const [startError, setStartError] = useState("");
  const [online, setOnline] = useState(true);
  const [toast, setToast] = useState(false);

  const submitting = phase === "submitting";

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setDestination("");
    setCountry("");
    setStartIso(seoulDateIso(new Date()));
    setDays(5);
    setPhase("idle");
    setDestError("");
    setStartError("");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => destRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      previousFocus.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(false), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const closeIfIdle = useCallback(() => {
    if (submitting) return;
    onClose();
  }, [onClose, submitting]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeIfIdle();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeIfIdle]);

  const nights = days - 1;
  const endIso = isValidIsoDate(startIso) ? addDays(startIso, nights) : "";
  const preview =
    isValidIsoDate(startIso) && endIso
      ? `${formatMd(startIso)} ~ ${formatMd(endIso)} · ${nights}박 ${days}일`
      : "";

  async function submit() {
    const trimmed = destination.trim();
    let ok = true;
    if (!trimmed) {
      setDestError("여행지를 입력해 주세요.");
      ok = false;
    } else {
      setDestError("");
    }
    if (!isValidIsoDate(startIso)) {
      setStartError("출발일을 골라 주세요.");
      ok = false;
    } else {
      setStartError("");
    }
    if (!ok || !online || submitting) return;

    setPhase("submitting");
    try {
      const trip = buildQuickTrip({
        destination: trimmed,
        country,
        startIso,
        days,
      });
      const saved = await addTrip(trip);
      setPhase("idle");
      onClose();
      setToast(true);
      onCreated?.(saved);
    } catch {
      setPhase("error");
    }
  }

  function onFormSubmit(e: FormEvent) {
    e.preventDefault();
    void submit();
  }

  function onDestKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(startId)?.focus();
    }
  }

  return {
    titleId,
    destId,
    startId,
    destErrorId,
    startErrorId,
    destRef: destRef as RefObject<HTMLInputElement>,
    panelRef: panelRef as RefObject<HTMLDivElement>,
    destination,
    setDestination,
    setCountry,
    startIso,
    setStartIso,
    days,
    setDays,
    phase,
    setPhase,
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
  };
}
