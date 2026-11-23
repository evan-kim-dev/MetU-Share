"use client";

import { useEffect, useRef } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { PartyChatComposeBar } from "@/components/community/PartyChatComposeBar";
import { PartyChatMessageList } from "@/components/community/PartyChatMessageList";
import {
  PartyChatBlockedState,
  PartyChatGuestState,
  PartyChatNotPartyState,
} from "@/components/community/PartyChatShellStates";
import { usePartyChat } from "@/components/community/usePartyChat";

interface PartyChatPageContentProps {
  postId: string;
  listHref: "/opod" | "/board";
}

export function PartyChatPageContent({
  postId,
  listHref,
}: PartyChatPageContentProps) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    user,
    provider,
    post,
    messages,
    draft,
    setDraft,
    loading,
    sending,
    attachError,
    isPartyPost,
    canChat,
    isPending,
    handleSend,
    handleAttachSelected,
  } = usePartyChat(postId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (!post || !isPartyPost) {
    return <PartyChatNotPartyState listHref={listHref} />;
  }

  if (!user || provider === "guest") {
    return <PartyChatGuestState listHref={listHref} />;
  }

  if (!canChat) {
    return (
      <PartyChatBlockedState
        listHref={listHref}
        postId={post.id}
        isPending={isPending}
      />
    );
  }

  return (
    <MobileShell
      title={post.title}
      showBack
      backHref={listHref}
      showBottomNav={false}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <PartyChatMessageList
          loading={loading}
          messages={messages}
          meId={user.id}
          endRef={endRef}
        />

        <PartyChatComposeBar
          draft={draft}
          setDraft={setDraft}
          sending={sending}
          attachError={attachError}
          fileInputRef={fileInputRef}
          onAttachSelected={(file) => void handleAttachSelected(file)}
          onSend={() => void handleSend()}
        />
      </div>
    </MobileShell>
  );
}
