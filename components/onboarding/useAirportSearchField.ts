"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
} from "react";
import {
  formatPlaceDestination,
  formatPlaceFlightLabel,
  type PlaceItem,
} from "@/lib/places/autocomplete";
import { usePlaceAutocomplete } from "@/lib/places/usePlaceAutocomplete";
import {
  getContinentId,
  CONTINENT_LABELS,
  type ContinentId,
} from "@/lib/airports/data";

export interface AirportSearchFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  /** 목록에서 장소 선택 시 (자유 입력은 호출되지 않음) */
  onSelectPlace?: (place: PlaceItem) => void;
  /** 선택 시 값 포맷 (기본: mode별 PlaceItem 포맷) */
  formatValue?: (place: PlaceItem) => string;
  variant?: "default" | "compact";
  /**
   * all — 도시+공항(코드 포함, 항공권 체크리스트용)
   * cities — 도시·나라 (온보딩·빠른 여행)
   */
  placesMode?: "all" | "cities";
  inputRef?: Ref<HTMLInputElement>;
  inputId?: string;
  disabled?: boolean;
  maxLength?: number;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
  onInputKeyDown?: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
}

export type AirportSearchGroup = {
  id: ContinentId | "flat";
  label: string;
  places: PlaceItem[];
};

function groupLocalByContinent(
  places: PlaceItem[]
): Array<{ id: ContinentId | "flat"; label: string; places: PlaceItem[] }> {
  const buckets = new Map<ContinentId, PlaceItem[]>();
  for (const place of places) {
    const fake = {
      id: place.id,
      kind: "city" as const,
      name: place.name,
      city: place.name,
      country: place.countryName ?? "",
      keywords: [] as string[],
    };
    const id = getContinentId(fake);
    const list = buckets.get(id);
    if (list) list.push(place);
    else buckets.set(id, [place]);
  }
  const order: ContinentId[] = [
    "east-asia",
    "southeast-asia",
    "europe",
    "americas",
    "oceania",
    "middle-east",
    "other",
  ];
  return order
    .filter((id) => (buckets.get(id)?.length ?? 0) > 0)
    .map((id) => ({
      id,
      label: CONTINENT_LABELS[id],
      places: buckets.get(id) ?? [],
    }));
}

export function useAirportSearchField({
  value,
  onChange,
  onSelectPlace,
  formatValue,
  placesMode = "all",
  inputId,
  onInputKeyDown,
}: Pick<
  AirportSearchFieldProps,
  | "value"
  | "onChange"
  | "onSelectPlace"
  | "formatValue"
  | "placesMode"
  | "inputId"
  | "onInputKeyDown"
>) {
  const resolvedFormat =
    formatValue ??
    (placesMode === "cities" ? formatPlaceDestination : formatPlaceFlightLabel);
  const listId = useId();
  const autoId = useId();
  const fieldId = inputId ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [value]);

  const searchText = useMemo(() => {
    if (!open) return "";
    if (query.trim() === value.trim()) return "";
    return query;
  }, [open, query, value]);

  const { items, loading, source } = usePlaceAutocomplete(
    searchText,
    placesMode
  );

  const useGrouped =
    !searchText.trim() && (source === "local" || source === null);

  const groupedResults = useMemo(() => {
    if (!useGrouped) {
      return [{ id: "flat" as const, label: "", places: items }];
    }
    return groupLocalByContinent(items);
  }, [items, useGrouped]);

  const flatPlaces = useMemo(
    () => groupedResults.flatMap((g) => g.places),
    [groupedResults]
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchText, items]);

  const handleSelect = (place: PlaceItem) => {
    const next = resolvedFormat(place);
    onChange(next);
    onSelectPlace?.(place);
    setQuery(next);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleFreeText = () => {
    const next = query.trim();
    if (!next) return;
    onChange(next);
    setQuery(next);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown") {
        setOpen(true);
        e.preventDefault();
        return;
      }
      onInputKeyDown?.(e);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery(value);
      setActiveIndex(-1);
      return;
    }

    const freeTextOption =
      searchText.trim() && flatPlaces.length === 0 && !loading ? 1 : 0;
    const count = flatPlaces.length + freeTextOption;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (count === 0) return;
      setActiveIndex((i) => (i + 1) % count);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (count === 0) return;
      setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1));
      return;
    }
    if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < flatPlaces.length) {
        e.preventDefault();
        const place = flatPlaces[activeIndex];
        if (place) handleSelect(place);
        return;
      }
      if (
        freeTextOption &&
        (activeIndex === flatPlaces.length || activeIndex < 0) &&
        searchText.trim()
      ) {
        // 결과 0개면 Enter로 자유 입력 확정
        if (flatPlaces.length === 0) {
          e.preventDefault();
          handleFreeText();
          return;
        }
      }
      onInputKeyDown?.(e);
      return;
    }

    onInputKeyDown?.(e);
  };

  const activeOptionId =
    activeIndex >= 0 && activeIndex < flatPlaces.length
      ? `${listId}-opt-${activeIndex}`
      : activeIndex === flatPlaces.length && searchText.trim()
        ? `${listId}-free`
        : undefined;

  const clearQuery = () => {
    setQuery("");
    onChange("");
    setOpen(true);
  };

  return {
    rootRef,
    fieldId,
    listId,
    open,
    setOpen,
    query,
    setQuery,
    activeIndex,
    searchText,
    loading,
    groupedResults,
    flatPlaces,
    resolvedFormat,
    placesMode,
    handleSelect,
    handleFreeText,
    onKeyDown,
    activeOptionId,
    clearQuery,
  };
}
