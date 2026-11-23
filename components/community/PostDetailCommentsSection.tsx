"use client";

import { useRouter } from "next/navigation";
import { Heart, MessageCircle } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthorAvatarLink } from "@/components/community/AuthorAvatarLink";
import type { CommunityPost, PostComment } from "@/lib/community/types";

interface PostDetailCommentsSectionProps {
  post: CommunityPost;
  listHref: "/opod" | "/board";
  commentCount: number;
  commentDraft: string;
  editingCommentId: string | null;
  commentEditDraft: string;
  needsLogin: boolean;
  canManageComment: (comment: PostComment) => boolean;
  isCommentLiked: (comment: PostComment) => boolean;
  onCommentDraftChange: (value: string) => void;
  onCommentEditDraftChange: (value: string) => void;
  onSetEditingCommentId: (id: string | null) => void;
  onSubmitComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onStartEditComment: (commentId: string, content: string) => void;
  onSaveComment: (commentId: string) => void;
  onToggleCommentLike: (postId: string, commentId: string) => void;
}

export function PostDetailCommentsSection({
  post,
  listHref,
  commentCount,
  commentDraft,
  editingCommentId,
  commentEditDraft,
  needsLogin,
  canManageComment,
  isCommentLiked,
  onCommentDraftChange,
  onCommentEditDraftChange,
  onSetEditingCommentId,
  onSubmitComment,
  onDeleteComment,
  onStartEditComment,
  onSaveComment,
  onToggleCommentLike,
}: PostDetailCommentsSectionProps) {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-4 border-t border-line-soft pt-5">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4.5 w-4.5 text-ink-body" />
        <h2 className="text-base font-bold text-ink-heading">
          댓글 {commentCount}
        </h2>
      </div>

      {post.commentList.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-caption">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {post.commentList.map((comment) => {
            const manageable = canManageComment(comment);
            const isEditing = editingCommentId === comment.id;
            const commentLiked = isCommentLiked(comment);
            const commentLikeCount = Math.max(
              comment.likes ?? 0,
              (comment.likedBy ?? []).length
            );

            return (
              <li
                key={comment.id}
                className="rounded-xl2 border border-line-soft bg-surface-white px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <AuthorAvatarLink
                      userId={comment.authorId}
                      name={comment.author}
                      avatar={comment.avatar}
                      size="sm"
                      showName
                      meta={comment.createdAt}
                      className="gap-2"
                    />
                  </div>
                  {manageable && !isEditing ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onStartEditComment(comment.id, comment.content)
                        }
                        className="rounded-md px-2 py-1 text-xs font-semibold text-ink-body"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteComment(comment.id)}
                        className="rounded-md px-2 py-1 text-xs font-semibold text-danger"
                      >
                        삭제
                      </button>
                    </div>
                  ) : null}
                </div>

                {isEditing ? (
                  <div className="mt-2">
                    <textarea
                      value={commentEditDraft}
                      onChange={(e) => onCommentEditDraftChange(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-line-soft px-3 py-2.5 text-sm text-ink-body outline-none focus:border-brand"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => onSaveComment(comment.id)}
                        disabled={!commentEditDraft.trim()}
                        className="rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSetEditingCommentId(null);
                          onCommentEditDraftChange("");
                        }}
                        className="rounded-lg border border-line-soft px-3 py-2 text-xs font-semibold text-ink-body"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-body">
                      {comment.content}
                    </p>
                    <div className="mt-2.5 flex items-center">
                      <button
                        type="button"
                        aria-label={
                          commentLiked ? "댓글 좋아요 취소" : "댓글 좋아요"
                        }
                        aria-pressed={commentLiked}
                        onClick={() => {
                          if (needsLogin) {
                            router.push(
                              `/login?next=${encodeURIComponent(`${listHref}/${post.id}`)}`
                            );
                            return;
                          }
                          onToggleCommentLike(post.id, comment.id);
                        }}
                        className={[
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors active:scale-95",
                          commentLiked
                            ? "bg-rose-50 text-rose-600"
                            : "bg-surface-soft text-ink-caption",
                        ].join(" ")}
                      >
                        <Heart
                          className={[
                            "h-3.5 w-3.5",
                            commentLiked
                              ? "fill-rose-500 text-rose-500"
                              : "",
                          ].join(" ")}
                          strokeWidth={2.2}
                        />
                        {commentLikeCount > 0 ? commentLikeCount : "좋아요"}
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-xl2 border border-line-soft bg-surface-white p-3">
        <textarea
          value={commentDraft}
          onChange={(e) => onCommentDraftChange(e.target.value)}
          rows={3}
          placeholder="댓글을 입력하세요"
          className="w-full resize-none rounded-lg border border-line-soft px-3 py-2.5 text-sm text-ink-body outline-none focus:border-brand"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmitComment();
            }
          }}
        />
        <PrimaryButton
          className="mt-2 h-11 min-h-tap rounded-xl text-sm"
          disabled={!commentDraft.trim()}
          onClick={onSubmitComment}
        >
          댓글 등록
        </PrimaryButton>
      </div>
    </section>
  );
}