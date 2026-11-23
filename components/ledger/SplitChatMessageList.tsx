"use client";

import type { RefObject } from "react";

import type { SplitChatMessage, SplitPreviewPayload } from "@/lib/ledger/split-chat";

import {
  SplitChatMemberAvatar,
  SplitChatMessageBubbleContent,
  SplitChatPreviewCard,
  SplitChatSystemBanner,
} from "./split-chat-room-parts";
import type { SplitChatMember } from "./split-chat-room-types";

type Props = {
  inline: boolean;
  loading: boolean;
  members: readonly SplitChatMember[];
  headerNames: readonly string[];
  exampleName: string;
  messages: readonly SplitChatMessage[];
  myId: string | null;
  dismissed: ReadonlySet<string>;
  isAnonymous: boolean;
  confirmingId: string | null;
  bottomRef: RefObject<HTMLDivElement | null>;
  resolveSenderName: (m: SplitChatMessage) => string;
  onConfirm: (message: SplitChatMessage, payload: SplitPreviewPayload) => void;
  onDismiss: (id: string) => void;
};

export function SplitChatMessageList({
  inline,
  loading,
  members,
  headerNames,
  exampleName,
  messages,
  myId,
  dismissed,
  isAnonymous,
  confirmingId,
  bottomRef,
  resolveSenderName,
  onConfirm,
  onDismiss,
}: Props) {
  return (
    <div
      className={
        inline
          ? "flex-1 space-y-3 px-3 py-3"
          : "min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3"
      }
    >
      {!loading ? (
        <SplitChatSystemBanner
          body={
            members.length > 0
              ? `${headerNames.slice(0, -1).join(", ") || "멤버"}와 MetU가 함께 있어요. 미리보기를 확인해야 반영돼요.`
              : "MetU와 분담을 맞춰 보세요. 미리보기를 확인해야 반영돼요."
          }
        />
      ) : null}

      {loading ? (
        <p className="text-center text-mu-caption text-mu-fg-3">
          불러오는 중…
        </p>
      ) : null}

      {!loading && messages.length === 0 ? (
        <div className="flex items-end gap-2">
          <SplitChatMemberAvatar name="MetU" toneKey="metu" bot size="sm" />
          <div className="min-w-0 max-w-[82%]">
            <p className="mb-0.5 px-1 text-mu-caption font-medium text-mu-fg-2">
              MetU
            </p>
            <div className="rounded-2xl rounded-tl-sm bg-mu-card px-3.5 py-2.5 text-mu-body text-mu-fg shadow-sm">
              분담을 바꾸고 싶으면 말해 주세요.
              <br />
              예: 「{exampleName}는 이 건에서 빼줘」
            </div>
          </div>
        </div>
      ) : null}

      {messages.map((m) => {
        const mine = m.senderKind === "user" && m.senderUserId === myId;
        const isAgent = m.senderKind === "agent";
        const isSystem = m.senderKind === "system";
        const showPreview =
          isAgent &&
          m.payload?.type === "split_preview" &&
          !dismissed.has(m.id);
        const name = resolveSenderName(m);

        if (isSystem) {
          return <SplitChatSystemBanner key={m.id} body={m.body} />;
        }

        if (mine) {
          return (
            <div key={m.id} className="flex flex-col items-end gap-1">
              <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-mu-accent px-3.5 py-2.5 text-mu-body text-mu-on-accent shadow-sm">
                <SplitChatMessageBubbleContent message={m} onAccent />
              </div>
            </div>
          );
        }

        return (
          <div key={m.id} className="flex items-end gap-2">
            <SplitChatMemberAvatar
              name={name}
              toneKey={m.senderUserId ?? m.id}
              bot={isAgent}
              size="sm"
            />
            <div className="min-w-0 max-w-[82%]">
              <p className="mb-0.5 px-1 text-mu-caption font-medium text-mu-fg-2">
                {name}
              </p>
              <div className="rounded-2xl rounded-tl-sm bg-mu-card px-3.5 py-2.5 text-mu-body text-mu-fg shadow-sm">
                <SplitChatMessageBubbleContent message={m} />
                {showPreview && m.payload?.type === "split_preview" ? (
                  <SplitChatPreviewCard
                    message={m}
                    payload={m.payload}
                    isAnonymous={isAnonymous}
                    confirmingId={confirmingId}
                    onConfirm={onConfirm}
                    onDismiss={onDismiss}
                  />
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
