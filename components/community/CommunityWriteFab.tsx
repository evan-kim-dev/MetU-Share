"use client";

import { PenLine } from "lucide-react";
import type { WritablePostCategory } from "@/lib/mock/community";

interface CommunityWriteFabProps {
  onOpenWrite: (category: WritablePostCategory) => void;
  resolveWriteCategory: () => WritablePostCategory;
}

export function CommunityWriteFab({
  onOpenWrite,
  resolveWriteCategory,
}: CommunityWriteFabProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6.75rem+env(safe-area-inset-bottom))] z-30 flex justify-center">
      <div className="pointer-events-none w-full max-w-mobile px-5">
        <div className="pointer-events-none flex justify-end">
          <button
            type="button"
            aria-label="글쓰기"
            onClick={() => onOpenWrite(resolveWriteCategory())}
            className="pointer-events-auto flex h-12 min-w-fab items-center justify-center gap-1.5 rounded-full bg-brand px-4 text-sm font-bold text-surface-white shadow-md transition-all duration-300 active:scale-95 active:brightness-95"
          >
            <PenLine className="h-5 w-5" strokeWidth={2.4} />
            <span>글쓰기</span>
          </button>
        </div>
      </div>
    </div>
  );
}