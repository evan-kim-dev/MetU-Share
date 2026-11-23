"use client";

import { Heart } from "lucide-react";

interface PostDetailPostLikeProps {
  postId: string;
  liked: boolean;
  likeCount: number;
  onToggleLike: (postId: string) => void;
}

export function PostDetailPostLike({
  postId,
  liked,
  likeCount,
  onToggleLike,
}: PostDetailPostLikeProps) {
  return (
    <div className="flex justify-end py-1">
      <button
        type="button"
        aria-label={liked ? "좋아요 취소" : "좋아요"}
        aria-pressed={liked}
        onClick={() => onToggleLike(postId)}
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors",
          liked
            ? "bg-rose-50 text-rose-600"
            : "bg-surface-soft text-ink-caption hover:text-ink-body",
        ].join(" ")}
      >
        <Heart
          className={[
            "h-5 w-5 transition-colors",
            liked ? "fill-rose-500 text-rose-500" : "",
          ].join(" ")}
          strokeWidth={2.2}
        />
        {likeCount}
      </button>
    </div>
  );
}