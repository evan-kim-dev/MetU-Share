"use client";

import { X } from "lucide-react";

import { SplitChatMemberAvatar } from "./split-chat-room-parts";
import type { SplitChatMember } from "./split-chat-room-types";

type Props = {
  stackMembers: readonly SplitChatMember[];
  headerSubtitle: string;
  inline: boolean;
  onOpenAdvanced?: () => void;
  onClose?: () => void;
};

export function SplitChatHeader({
  stackMembers,
  headerSubtitle,
  inline,
  onOpenAdvanced,
  onClose,
}: Props) {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-mu-line bg-mu-card px-3 py-2.5">
      <div
        className="relative h-9 shrink-0"
        style={{
          width: `${32 + Math.min(stackMembers.length, 3) * 14}px`,
        }}
        aria-hidden
      >
        {stackMembers.length === 0 ? (
          <SplitChatMemberAvatar name="MetU" toneKey="metu" bot size="sm" />
        ) : (
          <>
            {stackMembers.map((m, i) => (
              <div
                key={m.id}
                className="absolute top-0"
                style={{ left: `${i * 14}px`, zIndex: i + 1 }}
              >
                <SplitChatMemberAvatar
                  name={m.displayName}
                  toneKey={m.id}
                  size="sm"
                />
              </div>
            ))}
            <div
              className="absolute top-0"
              style={{
                left: `${Math.min(stackMembers.length, 3) * 14}px`,
                zIndex: 8,
              }}
            >
              <SplitChatMemberAvatar name="MetU" toneKey="metu" bot size="sm" />
            </div>
          </>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-mu-label font-bold text-mu-fg">
          분담 대화
        </p>
        <p
          className="truncate text-mu-caption text-mu-fg-3"
          data-testid="split-chat-members"
        >
          {headerSubtitle}
        </p>
      </div>
      {onOpenAdvanced ? (
        <button
          type="button"
          className="min-h-tap shrink-0 px-1 text-mu-caption font-semibold text-mu-fg-3"
          onClick={onOpenAdvanced}
        >
          고급
        </button>
      ) : null}
      {!inline && onClose ? (
        <button
          type="button"
          className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-mu-md text-mu-fg-2"
          aria-label="대화방 닫기"
          onClick={onClose}
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      ) : null}
    </header>
  );
}
