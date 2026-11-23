"use client";

import { Pencil, Trash2 } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { WritePostSheet } from "@/components/community/WritePostSheet";
import { PostDetailArticleIntro } from "@/components/community/PostDetailArticleIntro";
import { PostDetailPostLike } from "@/components/community/PostDetailPostLike";
import { PostDetailCommentsSection } from "@/components/community/PostDetailCommentsSection";
import { PostDetailPartySection } from "@/components/community/PostDetailPartySection";
import {
  PostDetailLoadingState,
  PostDetailNotFoundState,
} from "@/components/community/PostDetailShellStates";
import { usePostDetailActions } from "@/components/community/usePostDetailActions";
import type { PostDetailContentProps } from "@/components/community/post-detail-content.types";

export type { PostDetailContentProps } from "@/components/community/post-detail-content.types";

export function PostDetailContent({
  postId,
  listHref = "/board",
}: PostDetailContentProps) {
  const {
    post,
    isReady,
    commentDraft,
    setCommentDraft,
    editOpen,
    setEditOpen,
    editingCommentId,
    setEditingCommentId,
    commentEditDraft,
    setCommentEditDraft,
    updatePost,
    toggleLike,
    toggleCommentLike,
    isCommentLiked,
    leaveParty,
    cancelJoinRequest,
    acceptJoin,
    rejectJoin,
    canManageComment,
    editable,
    isParty,
    liked,
    joined,
    pending,
    isHost,
    isFull,
    slotsLeft,
    likeCount,
    commentCount,
    pendingMembers = [],
    needsLogin = false,
    handleJoinRequest,
    handleDelete,
    handleSubmitComment,
    handleDeleteComment,
    handleStartEditComment,
    handleSaveComment,
  } = usePostDetailActions(postId, listHref);

  if (!post && !isReady) {
    return <PostDetailLoadingState listHref={listHref} />;
  }

  if (!post) {
    return <PostDetailNotFoundState listHref={listHref} />;
  }

  return (
    <MobileShell
      title="게시글"
      showBack
      backHref={listHref}
      showBottomNav={false}
      rightSlot={
        editable ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="게시글 수정"
              onClick={() => setEditOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-body"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="게시글 삭제"
              onClick={handleDelete}
              className="flex h-9 w-9 items-center justify-center rounded-full text-danger"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ) : undefined
      }
    >
      <article className="flex flex-col gap-5 px-5 pb-10 pt-5">
        <PostDetailArticleIntro post={post} />

        {isParty ? (
          <PostDetailPartySection
            post={post}
            listHref={listHref}
            isHost={isHost ?? false}
            joined={joined ?? false}
            pending={pending ?? false}
            isFull={isFull ?? false}
            slotsLeft={slotsLeft ?? 0}
            needsLogin={needsLogin}
            pendingMembers={pendingMembers}
            onLeaveParty={leaveParty}
            onCancelJoinRequest={cancelJoinRequest}
            onAcceptJoin={acceptJoin}
            onRejectJoin={rejectJoin}
            onJoinRequest={handleJoinRequest}
          />
        ) : null}

        <PostDetailPostLike
          postId={post.id}
          liked={liked ?? false}
          likeCount={likeCount ?? 0}
          onToggleLike={toggleLike}
        />

        <PostDetailCommentsSection
          post={post}
          listHref={listHref}
          commentCount={commentCount ?? 0}
          commentDraft={commentDraft}
          editingCommentId={editingCommentId}
          commentEditDraft={commentEditDraft}
          needsLogin={needsLogin}
          canManageComment={canManageComment}
          isCommentLiked={isCommentLiked}
          onCommentDraftChange={setCommentDraft}
          onCommentEditDraftChange={setCommentEditDraft}
          onSetEditingCommentId={setEditingCommentId}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={handleDeleteComment}
          onStartEditComment={handleStartEditComment}
          onSaveComment={handleSaveComment}
          onToggleCommentLike={toggleCommentLike}
        />
      </article>

      <WritePostSheet
        open={editOpen}
        editingPost={post}
        onClose={() => setEditOpen(false)}
        onSubmit={(input) => {
          updatePost(post.id, input);
          setEditOpen(false);
        }}
      />
    </MobileShell>
  );
}