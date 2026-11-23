"use client";

import type { RefObject } from "react";
import {
  ChatMessageBody,
  ChatSenderAvatar,
} from "@/components/community/dm-chat-parts";
import { formatRelativeTime } from "@/lib/community/storage";
import type { DmMessage } from "@/lib/dm/dm-supabase";

export function DmChatMessageList({
  loading,
  messages,
  me,
  endRef,
}: {
  loading: boolean;
  messages: DmMessage[];
  me: string;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {loading ? (
        <p className="text-center text-xs text-ink-caption">불러오는 중…</p>
      ) : messages.length === 0 ? (
        <p className="text-center text-xs leading-relaxed text-ink-caption">
          아직 대화가 없어요. 먼저 인사해 보세요.
        </p>
      ) : (
        messages.map((message) => {
          const mine = message.senderId === me;
          const timeLabel = formatRelativeTime(message.createdAt);
          return (
            <div
              key={message.id}
              className={[
                "flex gap-1.5",
                mine ? "items-end justify-end" : "items-start justify-start",
              ].join(" ")}
            >
              {mine ? (
                <>
                  <p className="shrink-0 pb-1 text-2xs text-ink-caption">
                    {timeLabel}
                  </p>
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-surface-white">
                    <ChatMessageBody message={message.message} mine />
                  </div>
                </>
              ) : (
                <div className="flex max-w-[88%] items-start gap-2">
                  <ChatSenderAvatar
                    src={message.senderAvatar}
                    name={message.senderName}
                  />
                  <div className="flex min-w-0 flex-col items-start gap-1">
                    <p className="text-2xs font-bold text-ink-caption">
                      {message.senderName}
                    </p>
                    <div className="flex items-end gap-1.5">
                      <div className="rounded-2xl rounded-bl-md bg-surface-soft px-3.5 py-2.5 text-ink-body">
                        <ChatMessageBody
                          message={message.message}
                          mine={false}
                        />
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