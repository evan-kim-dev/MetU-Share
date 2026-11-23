"use client";

import { Search } from "lucide-react";
import { AirportSearchClearButton } from "@/components/onboarding/AirportSearchClearButton";
import { AirportSearchResults } from "@/components/onboarding/AirportSearchResults";
import {
  useAirportSearchField,
  type AirportSearchFieldProps,
} from "@/components/onboarding/useAirportSearchField";

export type { AirportSearchFieldProps };

export function AirportSearchField({
  label,
  placeholder,
  value,
  onChange,
  onSelectPlace,
  formatValue,
  variant = "default",
  placesMode = "all",
  inputRef,
  inputId,
  disabled,
  maxLength,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  onInputKeyDown,
}: AirportSearchFieldProps) {
  const {
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
    handleSelect,
    handleFreeText,
    onKeyDown,
    activeOptionId,
    clearQuery,
  } = useAirportSearchField({
    value,
    onChange,
    onSelectPlace,
    formatValue,
    placesMode,
    inputId,
    onInputKeyDown,
  });

  const isCompact = variant === "compact";

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1">
      <label
        htmlFor={fieldId}
        className={
          isCompact
            ? "text-xs font-semibold text-ink-caption"
            : "text-sm font-semibold text-ink-body"
        }
      >
        {label}
      </label>
      <div className="flex gap-1.5">
        <div
          className={[
            "group flex min-w-0 flex-1 items-center gap-2 border bg-surface-white transition-all",
            isCompact ? "h-10 rounded-lg px-3" : "rounded-2xl px-4",
            open
              ? "border-brand ring-4 ring-brand/10"
              : isCompact
                ? "border-line-soft focus-within:border-brand"
                : "border-line-muted focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10",
          ].join(" ")}
        >
          {!isCompact ? (
            <Search
              className="h-4 w-4 shrink-0 text-ink-caption"
              strokeWidth={2.2}
            />
          ) : null}
          <input
            ref={inputRef}
            id={fieldId}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            autoComplete="off"
            disabled={disabled}
            maxLength={maxLength}
            placeholder={placeholder}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              onChange(e.target.value);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            className={[
              "w-full min-w-0 flex-1 bg-transparent text-ink-heading placeholder:text-ink-caption/70 focus:outline-none disabled:opacity-60",
              isCompact ? "text-sm" : "py-3.5 text-base",
            ].join(" ")}
          />
          {query && !isCompact ? (
            <AirportSearchClearButton onClear={clearQuery} />
          ) : null}
        </div>
      </div>

      {open ? (
        <AirportSearchResults
          listId={listId}
          isCompact={isCompact}
          searchText={searchText}
          loading={loading}
          activeIndex={activeIndex}
          value={value}
          placesMode={placesMode}
          resolvedFormat={resolvedFormat}
          groupedResults={groupedResults}
          flatPlaces={flatPlaces}
          onSelect={handleSelect}
          onFreeText={handleFreeText}
        />
      ) : null}
    </div>
  );
}
