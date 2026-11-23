"use client";

import { useEffect, useRef, useState } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { SafeAvatar } from "@/components/ui/SafeAvatar";
import { DmChatComposeBar } from "@/components/community/DmChatComposeBar";
import { DmChatMessageList } from "@/components/community/DmChatMessageList";
import {
  DmChatBlockedState,
  DmChatGuestState,
} from "@/components/community/DmChatShellStates";
import type { DmChatPageContentProps } from "@/components/community/dm-chat.types";
import { useDmChatThread } from "@/components/community/useDmChatThread";

export function DmChatPageContent({ peerId }: DmChatPageContentProps) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    me,
    isGuest,
    peerName,
    peerAvatar,
    canChat,
    displayMessages,
    threadId,
    loading,
    sending,
    error,
    attachError,
    handleSend,
    handleAttachSelected,
  } = useDmChatThread(peerId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [displayMessages]);

  if (isGuest || !me) {
    return <DmChatGuestState peerId={peerId} />;
  }

  if (!canChat && !loading) {
    return <DmChatBlockedState error={error} />;
  }

  return (
    <MobileShell
      title={peerName}
      showBack
      backHref="/opod"
      showBottomNav={false}
      rightSlot={
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-line-soft bg-surface-soft">
          <SafeAvatar src={peerAvatar} alt={peerName} />
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <DmChatMessageList
          loading={loading}
          messages={displayMessages}
          me={me}
          endRef={endRef}
        />

        <DmChatComposeBar
          draft={draft}
          setDraft={setDraft}
          sending={sending}
          threadId={threadId}
          attachError={attachError}
          error={error}
          fileInputRef={fileInputRef}
          onAttachSelected={(file) => void handleAttachSelected(file)}
          onSend={() => void handleSend(draft, setDraft)}
        />
      </div>
    </MobileShell>
  );
}