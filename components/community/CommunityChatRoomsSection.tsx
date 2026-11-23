"use client";

import { useRouter } from "next/navigation";
import { Check, Settings } from "lucide-react";
import { formatChatClock } from "@/components/community/useCommunityListState";
import { markChatSeen } from "@/lib/community/chat-notice";
import type { CommunityPost } from "@/lib/community/types";

interface CommunityChatRoomsSectionProps {
  basePath: "/opod" | "/board";
  isReady: boolean;
  chatRoomPosts: CommunityPost[];
  chatManageMode: boolean;
  chatMenuOpen: boolean;
  selectedChatIds: string[];
  lastMessageByPostId: Record<string, string | undefined>;
  lastTimeByPostId: Record<string, string | undefined>;
  unreadCountByPostId: Record<string, number | undefined>;
  isPartyHost: (post: CommunityPost) => boolean;
  onSetChatMenuOpen: (updater: (prev: boolean) => boolean) => void;
  onOpenChatManage: () => void;
  onExitChatManage: () => void;
  onToggleChatSelection: (postId: string) => void;
  onLeaveSelected: () => void;
}

export function CommunityChatRoomsSection({
  basePath,
  isReady,
  chatRoomPosts,
  chatManageMode,
  chatMenuOpen,
  selectedChatIds,
  lastMessageByPostId,
  lastTimeByPostId,
  unreadCountByPostId,
  isPartyHost,
  onSetChatMenuOpen,
  onOpenChatManage,
  onExitChatManage,
  onToggleChatSelection,
  onLeaveSelected,
}: CommunityChatRoomsSectionProps) {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-heading font-extrabold leading-7 tracking-tight text-ink-heading">
          {chatManageMode ? "채팅방 관리" : "내 채팅방"}
        </h2>
        {chatManageMode ? (
          <button
            type="button"
            onClick={onExitChatManage}
            className="rounded-full px-2 py-1 text-xs font-semibold text-ink-caption transition-colors hover:bg-surface-soft"
          >
            취소
          </button>
        ) : (
          <div className="relative">
            <button
              type="button"
              aria-label="채팅방 설정"
              onClick={() => onSetChatMenuOpen((prev) => !prev)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-caption transition-colors hover:bg-surface-soft"
            >
              <Settings className="h-4 w-4" />
            </button>
            {chatMenuOpen ? (
              <div className="absolute right-0 top-8 z-10 min-w-menu rounded-2xl border-0 bg-surface-white p-1 shadow-md">
                <button
                  type="button"
                  onClick={onOpenChatManage}
                  className="w-full rounded-md px-3 py-2 text-left text-xs font-semibold text-ink-heading hover:bg-surface-soft"
                >
                  채팅방 관리
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {!isReady ? (
        <p className="mt-2 text-xs text-ink-caption">채팅방 불러오는 중...</p>
      ) : chatRoomPosts.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-ink-caption">
          동행에 참여하거나 내가 모집한 글에서 채팅방이 생성돼요.
        </p>
      ) : (
        <>
          <div className="mt-2 overflow-hidden rounded-2xl border-0 bg-surface-white shadow-sm">
            {chatRoomPosts.map((post) => {
              const host = isPartyHost(post);
              const selected = selectedChatIds.includes(post.id);

              return (
                <button
                  key={`chat-${post.id}`}
                  type="button"
                  onClick={() => {
                    if (chatManageMode) {
                      onToggleChatSelection(post.id);
                      return;
                    }
                    markChatSeen(post.id);
                    router.push(`${basePath}/${post.id}/chat`);
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b border-line-soft px-3 py-3 text-left last:border-b-0 active:bg-surface-soft"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {chatManageMode ? (
                      <span
                        aria-hidden
                        className={[
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          selected
                            ? "border-brand bg-brand"
                            : "border-line-soft bg-surface-white",
                        ].join(" ")}
                      >
                        {selected ? (
                          <Check className="h-3 w-3 stroke-[3] text-surface-white" />
                        ) : null}
                      </span>
                    ) : null}
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kakao text-sm font-extrabold text-ink-heading">
                      {post.title.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-heading">
                        {post.title}
                      </p>
                      <p className="truncate text-xs text-ink-caption">
                        {lastMessageByPostId[post.id] ?? "아직 채팅이 없어요"}
                      </p>
                    </div>
                  </div>
                  {chatManageMode ? (
                    host ? (
                      <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-2xs font-bold text-brand">
                        방장
                      </span>
                    ) : null
                  ) : (
                    <div className="ml-3 flex shrink-0 flex-col items-end">
                      <span className="text-xs font-semibold text-ink-caption">
                        {formatChatClock(lastTimeByPostId[post.id])}
                      </span>
                      {(unreadCountByPostId[post.id] ?? 0) > 0 ? (
                        <span className="mt-1 inline-flex min-w-5 items-center justify-center rounded-full bg-kakao-strong px-1.5 py-0.5 text-2xs font-bold text-ink-heading">
                          {unreadCountByPostId[post.id]}
                        </span>
                      ) : null}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {chatManageMode ? (
            <button
              type="button"
              disabled={selectedChatIds.length === 0}
              onClick={onLeaveSelected}
              className="mt-3 w-full rounded-xl border border-danger/20 bg-danger/5 py-3 text-sm font-bold text-danger disabled:cursor-not-allowed disabled:opacity-40"
            >
              {selectedChatIds.length > 0
                ? `선택한 ${selectedChatIds.length}개 채팅방 나가기`
                : "채팅방을 선택해 주세요"}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}