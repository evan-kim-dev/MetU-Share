"use client";

import { X } from "lucide-react";

export function AirportSearchClearButton({ onClear }: { onClear: () => void }) {
  return (
    <button
      type="button"
      aria-label="입력 지우기"
      onClick={onClear}
      className="flex h-11 w-11 items-center justify-center rounded-full text-ink-caption transition-colors active:bg-surface-soft"
    >
      <X className="h-4 w-4" strokeWidth={2.4} />
    </button>
  );
}
