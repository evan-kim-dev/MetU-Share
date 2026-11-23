"use client";

import { PenLine } from "lucide-react";

interface CommunityListHeaderProps {
  heading?: string;
  description?: string;
  postManageMode: boolean;
  showPostList: boolean;
  showManageActions: boolean;
  onExitPostManage: () => void;
  onOpenPostManage: () => void;
}

export function CommunityListHeader({
  heading,
  description = "",
  postManageMode,
  showPostList,
  showManageActions,
  onExitPostManage,
  onOpenPostManage,
}: CommunityListHeaderProps) {
  if (heading) {
    return (
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-heading font-bold tracking-tight text-ink-heading">
          {postManageMode ? "게시글 관리" : heading}
        </h1>
        {showPostList && showManageActions ? (
          postManageMode ? (
            <button
              type="button"
              onClick={onExitPostManage}
              className="rounded-full px-2 py-1 text-xs font-semibold text-ink-caption transition-colors hover:bg-surface-soft"
            >
              취소
            </button>
          ) : (
            <button
              type="button"
              aria-label="게시글 관리"
              onClick={onOpenPostManage}
              className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-surface-white text-ink-caption shadow-sm transition-all duration-300 hover:bg-surface-soft hover:text-ink-heading"
            >
              <PenLine className="h-4 w-4" strokeWidth={2.2} />
            </button>
          )
        ) : null}
      </div>
    );
  }

  if (description.trim()) {
    return (
      <p className="text-sm leading-relaxed text-ink-caption">{description}</p>
    );
  }

  return null;
}