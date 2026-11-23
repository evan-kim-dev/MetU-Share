"use client";

import { Globe, Loader2, MapPin, Plane } from "lucide-react";
import {
  formatPlaceListSubtitle,
  formatPlaceListTitle,
  type PlaceItem,
} from "@/lib/places/autocomplete";
import type { AirportSearchGroup } from "@/components/onboarding/useAirportSearchField";

export function AirportSearchResults({
  listId,
  isCompact,
  searchText,
  loading,
  activeIndex,
  value,
  placesMode,
  resolvedFormat,
  groupedResults,
  flatPlaces,
  onSelect,
  onFreeText,
}: {
  listId: string;
  isCompact: boolean;
  searchText: string;
  loading: boolean;
  activeIndex: number;
  value: string;
  placesMode: "all" | "cities";
  resolvedFormat: (place: PlaceItem) => string;
  groupedResults: AirportSearchGroup[];
  flatPlaces: PlaceItem[];
  onSelect: (place: PlaceItem) => void;
  onFreeText: () => void;
}) {
  return (
    <ul
      id={listId}
      role="listbox"
      className={[
        "absolute left-0 right-0 z-40 max-h-72 overflow-y-auto border border-line-soft bg-surface-white py-1 shadow-soft",
        isCompact
          ? "top-[calc(100%+4px)] rounded-lg"
          : "top-[calc(100%+6px)] rounded-2xl",
      ].join(" ")}
    >
      {flatPlaces.length === 0 && !loading ? (
        searchText.trim() ? (
          <li
            role="option"
            id={`${listId}-free`}
            aria-selected={activeIndex === 0}
          >
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onFreeText}
              className={[
                "flex min-h-11 w-full items-center px-4 py-2.5 text-left text-sm font-semibold text-brand transition-colors",
                activeIndex === 0 ? "bg-brand/8" : "hover:bg-surface-soft",
              ].join(" ")}
            >
              ‘{searchText.trim()}’ 그대로 쓰기
            </button>
          </li>
        ) : (
          <li className="px-3 py-2.5 text-sm text-ink-caption">
            검색 결과가 없어요
          </li>
        )
      ) : (
        groupedResults.map((group) => (
          <li key={group.id} role="presentation">
            {group.label ? (
              <div
                className={[
                  "sticky top-0 z-[1] border-b border-line-soft/80 bg-surface-soft/95 py-1.5 text-[11px] font-bold tracking-wide text-ink-caption backdrop-blur-sm",
                  isCompact ? "px-2.5" : "px-4",
                ].join(" ")}
              >
                {group.label}
              </div>
            ) : null}
            <ul role="group" aria-label={group.label || "검색 결과"}>
              {group.places.map((place) => {
                const flatIdx = flatPlaces.indexOf(place);
                const selected = value === resolvedFormat(place);
                const active = flatIdx === activeIndex;
                const title = formatPlaceListTitle(place, placesMode);
                const subtitle = formatPlaceListSubtitle(place);
                const Icon =
                  place.type === "country"
                    ? Globe
                    : place.type === "airport"
                      ? Plane
                      : MapPin;
                return (
                  <li
                    key={place.id}
                    id={`${listId}-opt-${flatIdx}`}
                    role="option"
                    aria-selected={selected || active}
                  >
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSelect(place)}
                      className={[
                        "flex min-h-11 w-full items-start gap-2.5 text-left transition-colors",
                        isCompact ? "px-3 py-2" : "gap-3 px-4 py-2.5",
                        selected || active
                          ? "bg-brand/8"
                          : "hover:bg-surface-soft active:bg-surface-soft",
                        place.type === "airport" && placesMode === "all"
                          ? isCompact
                            ? "pl-6"
                            : "pl-8"
                          : "",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "mt-0.5 flex shrink-0 items-center justify-center rounded-full",
                          isCompact ? "h-6 w-6" : "h-8 w-8",
                          place.type === "airport" && placesMode === "all"
                            ? "bg-surface-soft text-ink-caption"
                            : "bg-brand/10 text-brand",
                        ].join(" ")}
                      >
                        <Icon
                          className={isCompact ? "h-3 w-3" : "h-4 w-4"}
                          strokeWidth={2.2}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={[
                            "block truncate font-bold text-ink-heading",
                            isCompact ? "text-xs" : "text-sm",
                          ].join(" ")}
                        >
                          {title}
                        </span>
                        {subtitle ? (
                          <span className="block text-xs text-ink-caption">
                            {subtitle}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))
      )}
      {loading ? (
        <li
          role="presentation"
          className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-ink-caption"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          검색 중…
        </li>
      ) : null}
    </ul>
  );
}
