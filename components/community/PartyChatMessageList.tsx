"use client";

import type { RefObject } from "react";
import {
  ChatMessageBody,
  ChatSenderAvatar,
} from "@/components/community/party-chat-parts";
import { formatRelativeTime } from "@/lib/community/storage";
import type { PartyChatMessage } from "@/lib/community/chat-supabase";

export function PartyChatMessageList({
  loading,
  messages,
  meId,
  endRef,
}: {
  loading: boolean;
  messages: PartyChatMessage[];
  meId: string;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      {loading ? (
        <p className="py-10 text-center text-sm text-ink-caption">
          채팅 불러오는 중...
        </p>
      ) : messages.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-caption">
          첫 메시지를 남겨보세요.
        </p>
      ) : (
        messages.map((message) => {
          const mine = message.senderId === meId;
          const timeLabel = formatRelativeTime(message.createdAt);
          return (
            <div
              key={message.id}
              className={`flex gap-1.5 ${mine ? "items-end justify-end" : "items-start justify-start"}`}
            >
              {mine ? (
                <>
                  <p className="shrink-0 pb-1 text-2xs text-ink-caption">
                    {timeLabel}
                  </p>
                  <div className="max-w-[80%] rounded-2xl bg-brand px-3.5 py-2.5 text-surface-white">
                    <ChatMessageBody message={message.message} />
                  </div>
                </>
              ) : (
                <div className="flex max-w-[85%] items-start gap-2">
                  <ChatSenderAvatar
                    src={message.senderAvatar}
                    name={message.senderName}
                  />
                  <div className="flex min-w-0 flex-col items-start gap-1">
                    <p className="text-xs font-bold text-ink-caption">
                      {message.senderName}
                    </p>
                    <div className="flex items-end gap-1.5">
                      <div className="rounded-2xl bg-surface-soft px-3.5 py-2.5 text-ink-body">
                        <ChatMessageBody message={message.message} />
                      </div>
                      <p className="shrink-0 pb-1 text-2xs text-ink-caption">
                        {timeLabel}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
      <div ref={endRef} />
    </div>
  );
}
