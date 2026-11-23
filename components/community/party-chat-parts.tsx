"use client";

import { SafeAvatar } from "@/components/ui/SafeAvatar";
import { parsePartyChatAttachment } from "@/lib/community/chat-attachments";

export function ChatMessageBody({ message }: { message: string }) {
  const attachment = parsePartyChatAttachment(message);

  if (attachment?.type === "image") {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt="첨부 이미지"
          className="max-h-56 max-w-full object-cover"
        />
      </a>
    );
  }

  if (attachment?.type === "file") {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm underline underline-offset-2"
      >
        <span aria-hidden>📎</span>
        <span className="break-all">{attachment.name}</span>
      </a>
    );
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message}</p>
  );
}

export function ChatSenderAvatar({ src, name }: { src: string; name: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-soft bg-surface-soft">
      <SafeAvatar
        src={src}
        alt={`${name} 프로필`}
        fallback="💬"
        textClassName="text-lg leading-none"
      />
    </div>
  );
}
