"use client";

import { Images } from "lucide-react";
import type { DetailTab, NavTab } from "@/components/trips/trip-detail-content.types";

export function TripDetailNavTabs({
  tripId,
  detailTab,
  setDetailTab,
  onNavigate,
}: {
  tripId: string;
  detailTab: DetailTab;
  setDetailTab: (tab: DetailTab) => void;
  onNavigate: (href: string) => void;
}) {
  return (
    <div
      className="flex rounded-full bg-surface-soft p-1"
      role="tablist"
      aria-label="여행 상세 탭"
    >
      {(
        [
          ["summary", "요약"],
          ["schedule", "일정"],
          ["photos", "사진"],
          ["ledger", "가계부"],
          ["settle", "정산"],
        ] as const satisfies ReadonlyArray<readonly [NavTab, string]>
      ).map(([key, label]) => {
        const selected =
          key === "ledger" || key === "settle" || key === "photos"
            ? false
            : detailTab === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => {
              if (key === "ledger") {
                onNavigate(`/trips/${tripId}/ledger`);
                return;
              }
              if (key === "settle") {
                onNavigate(`/trips/${tripId}/ledger?step=settle`);
                return;
              }
              if (key === "photos") {
                onNavigate(`/trips/${tripId}/photos`);
                return;
              }
              setDetailTab(key);
            }}
            className={`min-h-tap flex-1 rounded-full px-1 py-2 text-xs font-bold transition sm:text-sm ${
              selected
                ? "bg-surface-white text-brand shadow-sm"
                : "text-ink-body"
            }`}
          >
            {key === "photos" ? (
              <span className="inline-flex items-center justify-center gap-1">
                <Images className="h-3.5 w-3.5" aria-hidden />
                {label}
              </span>
            ) : (
              label
            )}
          </button>
        );
      })}
    </div>
  );
}