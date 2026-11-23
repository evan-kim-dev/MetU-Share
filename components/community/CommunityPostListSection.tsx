"use client";

import { Check } from "lucide-react";
import { PostCard } from "@/components/community/PostCard";
import type { CommunityPost } from "@/lib/community/types";
import type { WritablePostCategory } from "@/lib/mock/community";

interface CommunityPostListSectionProps {
  basePath: "/opod" | "/board";
  isReady: boolean;
  filteredPosts: CommunityPost[];
  searchQuery: string;
  postManageMode: boolean;
  selectedPostIds: string[];
  canEdit: (post: CommunityPost) => boolean;
  onOpenWrite: (category: WritablePostCategory) => void;
  resolveWriteCategory: () => WritablePostCategory;
  onTogglePostSelection: (post: CommunityPost) => void;
  onDeleteSelectedPosts: () => void;
}

export function CommunityPostListSection({
  basePath,
  isReady,
  filteredPosts,
  searchQuery,
  postManageMode,
  selectedPostIds,
  canEdit,
  onOpenWrite,
  resolveWriteCategory,
  onTogglePostSelection,
  onDeleteSelectedPosts,
}: CommunityPostListSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      {!isReady ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="불러오는 중">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl2 bg-surface-soft"
            />
          ))}
        </div>
      ) : filteredPosts.length === 0 && searchQuery.trim() ? (
        <div className="rounded-2xl border-0 bg-surface-soft shadow-sm px-4 py-10 text-center">
          <p className="text-sm font-semibold text-ink-heading">
            &apos;{searchQuery.trim()}&apos; 검색 결과가 없어요
          </p>
          <p className="mt-1 text-xs text-ink-caption">
            다른 키워드로 다시 검색해 보세요.
          </p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border-0 bg-surface-soft shadow-sm px-4 py-10 text-center">
          <p className="text-sm font-semibold text-ink-heading">
            아직 게시글이 없어요
          </p>
          <p className="mt-1 text-xs text-ink-caption">
            얼리 액세스 첫 글을 남겨보세요.
          </p>
          <button
            type="button"
            onClick={() => onOpenWrite(resolveWriteCategory())}
            className="mt-3 text-sm font-bold text-brand"
          >
            첫 글 작성하기
          </button>
        </div>
      ) : (
        filteredPosts.map((post) => {
          const editable = canEdit(post);
          const selected = selectedPostIds.includes(post.id);

          if (!postManageMode) {
            return (
              <PostCard key={post.id} post={post} basePath={basePath} />
            );
          }

          return (
            <button
              key={post.id}
              type="button"
              disabled={!editable}
              onClick={() => onTogglePostSelection(post)}
              className={[
                "flex w-full items-start gap-3 rounded-2xl border-0 bg-surface-white p-4 text-left shadow-sm transition-all duration-300",
                selected
                  ? "border-brand/40 bg-brand/[0.03]"
                  : "border-line-soft",
                editable
                  ? "active:bg-surface-soft"
                  : "cursor-not-allowed opacity-45",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={[
                  "mt-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  selected
                    ? "border-brand bg-brand"
                    : "border-line-soft bg-surface-white",
                ].join(" ")}
              >
                {selected ? (
                  <Check className="h-3 w-3 stroke-[3] text-surface-white" />
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <PostCard post={post} basePath={basePath} interactive={false} />
              </div>
            </button>
          );
        })
      )}

      {postManageMode ? (
        <button
          type="button"
          disabled={selectedPostIds.length === 0}
          onClick={onDeleteSelectedPosts}
          className="mt-1 w-full rounded-xl border border-danger/20 bg-danger/5 py-3 text-sm font-bold text-danger disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selectedPostIds.length > 0
            ? `선택한 ${selectedPostIds.length}개 게시글 삭제`
            : "삭제할 내 글을 선택해 주세요"}
        </button>
      ) : null}
    </div>
  );
}