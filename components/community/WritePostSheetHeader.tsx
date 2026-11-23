"use client";

import { X } from "lucide-react";

interface WritePostSheetHeaderProps {
  isEditing: boolean;
  onClose: () => void;
}

export function WritePostSheetHeader({
  isEditing,
  onClose,
}: WritePostSheetHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[17px] font-semibold tracking-tight text-ink-heading">
        {isEditing ? "게시글 수정" : "글쓰기"}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-ink-body transition-transform active:scale-95"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}