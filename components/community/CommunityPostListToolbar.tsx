"use client";

import { ArrowUpDown, Check, Search, X } from "lucide-react";
import {
  SORT_LABELS,
  type PostSort,
} from "@/components/community/useCommunityListState";
import { HorizontalScroller } from "@/components/ui/HorizontalScroller";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/mock/community";

interface CommunityPostListToolbarProps {
  categories: PostCategory[];
  activeCategory: PostCategory;
  sortBy: PostSort;
  sortMenuOpen: boolean;
  searchOpen: boolean;
  searchQuery: string;
  onSetActiveCategory: (category: PostCategory) => void;
  onSetSortBy: (sort: PostSort) => void;
  onSetSortMenuOpen: (updater: (prev: boolean) => boolean) => void;
  onSetSearchOpen: (updater: (prev: boolean) => boolean) => void;
  onSetSearchQuery: (query: string) => void;
}

export function CommunityPostListToolbar({
  categories,
  activeCategory,
  sortBy,
  sortMenuOpen,
  searchOpen,
  searchQuery,
  onSetActiveCategory,
  onSetSortBy,
  onSetSortMenuOpen,
  onSetSearchOpen,
  onSetSearchQuery,
}: CommunityPostListToolbarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <HorizontalScroller aria-label="게시판 카테고리">
          {categories.length > 1
            ? categories.map((category) => {
                const active = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onSetActiveCategory(category)}
                    className={[
                      "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors",
                      active
                        ? category === "party"
                          ? "bg-brand text-surface-white shadow-md"
                          : "bg-brand text-surface-white shadow-md"
                        : "border-0 bg-surface-white text-ink-caption shadow-sm",
                    ].join(" ")}
                  >
                    {CATEGORY_LABELS[category]}
                  </button>
                );
              })
            : null}
        </HorizontalScroller>

        <button
          type="button"
          aria-label="게시글 검색"
          aria-pressed={searchOpen}
          onClick={() => {
            onSetSearchOpen((prev) => {
              if (prev) onSetSearchQuery("");
              return !prev;
            });
            onSetSortMenuOpen(() => false);
          }}
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
            searchOpen || searchQuery.trim()
              ? "border-brand/30 bg-brand/10 text-brand"
              : "border-line-soft bg-surface-white text-ink-caption hover:bg-surface-soft",
          ].join(" ")}
        >
          <Search className="h-4 w-4" strokeWidth={2.2} />
        </button>

        <div className="relative shrink-0">
          <button
            type="button"
            aria-label={`정렬: ${SORT_LABELS[sortBy]}`}
            onClick={() => {
              onSetSortMenuOpen((prev) => !prev);
              onSetSearchOpen(() => false);
            }}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
              sortBy === "latest"
                ? "border-line-soft bg-surface-white text-ink-caption hover:bg-surface-soft"
                : "border-brand/30 bg-brand/10 text-brand",
            ].join(" ")}
          >
            <ArrowUpDown className="h-4 w-4" strokeWidth={2.2} />
          </button>
          {sortMenuOpen ? (
            <div className="absolute right-0 top-10 z-10 min-w-menu rounded-2xl border-0 bg-surface-white p-1 shadow-md">
              {(Object.keys(SORT_LABELS) as PostSort[]).map((option) => {
                const selected = sortBy === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onSetSortBy(option);
                      onSetSortMenuOpen(() => false);
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs font-semibold text-ink-heading hover:bg-surface-soft"
                  >
                    <span>{SORT_LABELS[option]}</span>
                    {selected ? (
                      <Check className="h-3.5 w-3.5 text-brand" strokeWidth={2.4} />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {searchOpen ? (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-caption" />
          <input
            value={searchQuery}
            onChange={(event) => onSetSearchQuery(event.target.value)}
            placeholder="제목, 내용, 여행지, 작성자 검색"
            className="h-11 w-full rounded-2xl border-0 bg-surface-white shadow-sm pl-10 pr-10 text-sm text-ink-heading outline-none transition-colors placeholder:text-ink-caption focus:border-brand"
            autoFocus
          />
          {searchQuery ? (
            <button
              type="button"
              aria-label="검색어 지우기"
              onClick={() => onSetSearchQuery("")}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-caption transition-colors hover:bg-surface-soft"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}