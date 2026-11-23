"use client";

import { ChevronLeft, Pencil } from "lucide-react";
import { ScreenHeader } from "@/components/ds";

export function RecommendResultHeader({
  destination,
  dateRange,
  nights,
  onBack,
  onEdit,
}: {
  destination: string;
  dateRange: string;
  nights: number;
  onBack: () => void;
  onEdit: () => void;
}) {
  return (
    <ScreenHeader
      left={
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로"
          className="mu-focus flex h-11 w-11 items-center justify-center rounded-mu-md text-mu-fg"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden />
        </button>
      }
      center={
        <div className="min-w-0 text-center">
          <p className="truncate text-mu-body font-semibold text-mu-fg">
            {destination}
          </p>
          <p className="truncate text-mu-caption text-mu-fg-3">
            {dateRange}
            {nights > 0 ? ` · ${nights}박` : ""}
          </p>
        </div>
      }
      right={
        <button
          type="button"
          onClick={onEdit}
          className="mu-focus flex min-h-tap items-center gap-1 rounded-mu-md px-2 text-mu-label font-semibold text-mu-accent"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          수정
        </button>
      }
    />
  );
}