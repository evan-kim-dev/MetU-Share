"use client";

import { CATEGORY_LABELS, type WritablePostCategory } from "@/lib/mock/community";
import { WRITE_CATEGORIES } from "@/components/community/write-post-sheet.types";

interface WritePostCategoryChipsProps {
  category: WritablePostCategory;
  isEditing: boolean;
  onCategoryChange: (category: WritablePostCategory) => void;
}

export function WritePostCategoryChips({
  category,
  isEditing,
  onCategoryChange,
}: WritePostCategoryChipsProps) {
  return (
  <>
    <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
      {WRITE_CATEGORIES.map((item) => (
        <button
          key={item}
          type="button"
          disabled={isEditing}
          onClick={() => onCategoryChange(item)}
          className={[
            "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-all active:scale-95",
            category === item
              ? "bg-brand text-surface-white"
              : "bg-surface-soft text-ink-caption",
          ].join(" ")}
        >
          {CATEGORY_LABELS[item]}
        </button>
      ))}
    </div>

    {category === "party" ? (
      <div className="mb-4 rounded-xl border border-brand/15 bg-surface-soft px-3 py-2.5 text-xs leading-5 text-brand-strong">
        같이 여행할 일정·인원·예산을 적어 동행을 구해보세요. 내 여행 일정도 공유할 수 있어요.
      </div>
    ) : null}
  </>
  );
}