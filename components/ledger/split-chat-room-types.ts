import type { SplitChatMessage } from "@/lib/ledger/split-chat";

export type SplitChatMember = {
  id: string;
  displayName: string;
  userId?: string | null;
};

export type SplitChatRoomProps = {
  tripId: string;
  /** 여행 멤버 — 헤더·말풍선 아바타에 표시 */
  members?: readonly SplitChatMember[];
  /** overlay: 풀스크린 시트. inline: 정산 화면 안 카톡형 패널(기본). */
  variant?: "inline" | "overlay";
  open?: boolean;
  onClose?: () => void;
  /** 고급 분담(칩/배치) 경로 */
  onOpenAdvanced?: () => void;
};

export type SplitChatListResponse = {
  ok?: boolean;
  threadId?: string;
  messages?: SplitChatMessage[];
  error?: string;
};

export type SplitChatSendResponse = {
  ok?: boolean;
  threadId?: string;
  userMessage?: SplitChatMessage | null;
  agentMessage?: SplitChatMessage | null;
  error?: string;
};

export type SplitChatConfirmResponse = {
  ok?: boolean;
  already?: boolean;
  systemMessage?: SplitChatMessage | null;
  error?: string;
  message?: string;
};