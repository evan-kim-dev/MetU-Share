"use client";

import { AuthorAvatarLink } from "@/components/community/AuthorAvatarLink";
import { PostImageGallery } from "@/components/community/PostImageGallery";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from "@/lib/mock/community";
import type { CommunityPost } from "@/lib/community/types";

interface PostDetailArticleIntroProps {
  post: CommunityPost;
}

export function PostDetailArticleIntro({ post }: PostDetailArticleIntroProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <AuthorAvatarLink
            userId={post.authorId}
            name={post.author}
            avatar={post.avatar}
            size="md"
            showName
            meta={post.createdAt}
          />
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${CATEGORY_COLORS[post.category]}`}
        >
          {CATEGORY_LABELS[post.category]}
        </span>
      </div>

      <div>
        <span className="text-xs font-semibold text-brand">{post.destination}</span>
        <h1 className="mt-1 text-2xl font-extrabold leading-snug text-ink-heading">
          {post.title}
        </h1>
      </div>

      <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-body">
        {post.preview}
      </p>

      {post.images && post.images.length > 0 ? (
        <PostImageGallery images={post.images} variant="detail" />
      ) : null}
    </>
  );
}