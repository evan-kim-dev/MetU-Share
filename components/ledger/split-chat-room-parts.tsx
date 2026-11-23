"use client";

import { Bot, Paperclip, Zap } from "lucide-react";

import { Button } from "@/components/ds/Button";
import {
  type SplitAttachmentPayload,
  type SplitChatMessage,
  type SplitPreviewPayload,
} from "@/lib/ledger/split-chat";
import { formatKRW } from "@/lib/shared/format";

import {
  splitChatInitialOf,
  splitChatToneFor,
} from "./split-chat-room-utils";

export function SplitChatMemberAvatar({
  name,
  toneKey,
  bot,
  size = "md",
}: {
  name: string;
  toneKey: string;
  bot?: boolean;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-8 w-8 text-mu-caption" : "h-9 w-9 text-mu-label";
  if (bot) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-mu-accent text-mu-on-accent ${box}`}
        aria-hidden
      >
        <Bot className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      </div>
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${box} ${splitChatToneFor(toneKey)}`}
      aria-hidden
    >
      {splitChatInitialOf(name)}
    </div>
  );
}

function AttachmentBlock({
  payload,
  onAccent,
}: {
  payload: SplitAttachmentPayload;
  onAccent?: boolean;
}) {
  if (payload.kind === "image") {
    return (
      <a
        href={payload.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-mu-md"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 채팅 첨부 미리보기 */}
        <img
          src={payload.url}
          alt={payload.fileName}
          className="max-h-48 w-full object-cover"
        />
      </a>
    );
  }
  return (
    <a
      href={payload.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-tap items-center gap-2 break-all text-mu-caption font-semibold underline ${
        onAccent ? "text-mu-on-accent" : "text-mu-accent"
      }`}
    >
      <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
      {payload.fileName}
    </a>
  );
}

export function SplitChatMessageBubbleContent({
  message,
  onAccent,
}: {
  message: SplitChatMessage;
  onAccent?: boolean;
}) {
  const attach =
    message.payload?.type === "attachment" ? message.payload : null;
  const showBody =
    !attach ||
    (message.body !== "사진" && message.body !== attach.fileName);

  return (
    <div className="flex flex-col gap-2">
      {attach ? <AttachmentBlock payload={attach} onAccent={onAccent} /> : null}
      {showBody || !attach ? (
        <p className="whitespace-pre-wrap">{message.body}</p>
      ) : null}
    </div>
  );
}

export function SplitChatPreviewCard({
  message,
  payload,
  isAnonymous,
  confirmingId,
  onConfirm,
  onDismiss,
}: {
  message: SplitChatMessage;
  payload: SplitPreviewPayload;
  isAnonymous: boolean;
  confirmingId: string | null;
  onConfirm: (message: SplitChatMessage, payload: SplitPreviewPayload) => void;
  onDismiss: (messageId: string) => void;
}) {
  const guestBlocked = isAnonymous && !payload.canGuestConfirm;
  const busy = confirmingId === message.id;

  return (
    <div
      data-testid="split-preview-card"
      className="mt-2 border-t border-mu-line pt-2"
    >
      <p className="text-mu-caption font-semibold text-mu-fg-2">
        {payload.label}
      </p>
      <ul className="mt-1.5 space-y-1">
        {payload.after.map((row) => {
          const before =
            payload.before.find((b) => b.memberId === row.memberId)?.krw ?? 0;
          const changed = before !== row.krw;
          return (
            <li
              key={row.memberId}
              className="flex items-center justify-between gap-2 text-mu-caption"
            >
              <span className="text-mu-fg">{row.name}</span>
              <span
                className={`mu-num font-bold ${
                  changed ? "text-mu-accent" : "text-mu-fg-3"
                }`}
              >
                {changed ? `${formatKRW(before)} → ` : ""}
                {formatKRW(row.krw)}
              </span>
            </li>
          );
        })}
      </ul>
      {guestBlocked ? (
        <p className="mt-2 text-mu-caption text-mu-warn">
          다른 사람 몫 변경은 호스트만 확인할 수 있어요.
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            className="min-h-11 flex-1 rounded-full"
            loading={busy}
            disabled={busy}
            onClick={() => onConfirm(message, payload)}
          >
            적용
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="min-h-11 flex-1 rounded-full"
            disabled={busy}
            onClick={() => onDismiss(message.id)}
          >
            되돌리기
          </Button>
        </div>
      )}
    </div>
  );
}

export function SplitChatSystemBanner({ body }: { body: string }) {
  const looksLikeCard =
    body.includes("카드") || body.includes("승인") || body.includes("알림");
  return (
    <div
      className="mx-auto flex max-w-[94%] items-start gap-2 rounded-mu-lg border border-mu-line bg-mu-card px-3 py-2.5 text-left text-mu-caption text-mu-fg shadow-sm"
      role="status"
    >
      {looksLikeCard ? (
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mu-warn-soft text-mu-warn">
          <Zap className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        </span>
      ) : null}
      <p className="min-w-0 flex-1 leading-snug">{body}</p>
    </div>
  );
}