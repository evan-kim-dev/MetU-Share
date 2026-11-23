import type { SplitChatMessage } from "@/lib/ledger/split-chat";
import type { TripMember } from "@/lib/ledger/types";

import type { SplitChatMember } from "./split-chat-room-types";

export const SPLIT_CHAT_AVATAR_TONES = [
  "bg-mu-accent-soft text-mu-accent",
  "bg-mu-ok-soft text-mu-ok",
  "bg-mu-warn-soft text-mu-warn",
  "bg-mu-sunken text-mu-fg-2",
] as const;

export function splitChatInitialOf(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  return t.slice(0, 1);
}

export function splitChatToneFor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h + key.charCodeAt(i) * (i + 1)) % 97;
  return SPLIT_CHAT_AVATAR_TONES[h % SPLIT_CHAT_AVATAR_TONES.length]!;
}

export function mergeSplitChatMessages(
  prev: SplitChatMessage[],
  next: SplitChatMessage
): SplitChatMessage[] {
  if (prev.some((m) => m.id === next.id)) return prev;
  return [...prev, next].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}

/** SettleStep 등에서 TripMember 그대로 넘길 때 */
export function toSplitChatMembers(
  members: readonly TripMember[]
): SplitChatMember[] {
  return members.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    userId: m.userId ?? null,
  }));
}