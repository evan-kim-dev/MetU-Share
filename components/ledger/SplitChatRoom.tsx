"use client";

import { SplitChatComposer } from "./SplitChatComposer";
import { SplitChatHeader } from "./SplitChatHeader";
import { SplitChatMessageList } from "./SplitChatMessageList";
import { type SplitChatRoomProps } from "./split-chat-room-types";
import { useSplitChatRoom } from "./useSplitChatRoom";

export type { SplitChatMember } from "./split-chat-room-types";
export { toSplitChatMembers } from "./split-chat-room-utils";

/**
 * 분담 실시간 대화방. MetU AI 미리보기 → 확인 시에만 서버 apply.
 */
export function SplitChatRoom({
  tripId,
  members = [],
  variant = "inline",
  open = true,
  onClose,
  onOpenAdvanced,
}: SplitChatRoomProps) {
  const {
    myId,
    isAnonymous,
    messages,
    dismissed,
    text,
    setText,
    loading,
    sending,
    confirmingId,
    error,
    bottomRef,
    inputRef,
    fileRef,
    inline,
    headerNames,
    headerSubtitle,
    exampleName,
    stackMembers,
    handleSend,
    handleAttachSelected,
    handleConfirm,
    resolveSenderName,
    dismissPreview,
  } = useSplitChatRoom({ tripId, members, variant, open });

  if (!open) return null;

  const panel = (
    <div
      className={
        inline
          ? "flex min-h-[28rem] w-full flex-col border-y border-mu-line bg-mu-sunken"
          : "relative z-10 flex h-[min(92dvh,720px)] w-full max-w-mobile flex-col overflow-hidden rounded-t-mu-xl border border-mu-line bg-mu-sunken shadow-mu-sheet sm:rounded-mu-xl"
      }
      data-testid="split-chat-room"
      role={inline ? "region" : "dialog"}
      aria-modal={inline ? undefined : true}
      aria-label="분담 대화방"
    >
      <SplitChatHeader
        stackMembers={stackMembers}
        headerSubtitle={headerSubtitle}
        inline={inline}
        onOpenAdvanced={onOpenAdvanced}
        onClose={onClose}
      />

      <SplitChatMessageList
        inline={inline}
        loading={loading}
        members={members}
        headerNames={headerNames}
        exampleName={exampleName}
        messages={messages}
        myId={myId}
        dismissed={dismissed}
        isAnonymous={isAnonymous}
        confirmingId={confirmingId}
        bottomRef={bottomRef}
        resolveSenderName={resolveSenderName}
        onConfirm={(message, payload) => void handleConfirm(message, payload)}
        onDismiss={dismissPreview}
      />

      <SplitChatComposer
        text={text}
        onTextChange={setText}
        sending={sending}
        myId={myId}
        exampleName={exampleName}
        error={error}
        inputRef={inputRef}
        fileRef={fileRef}
        onSend={(e) => void handleSend(e)}
        onAttachSelected={(file) => void handleAttachSelected(file)}
      />
    </div>
  );

  if (inline) return panel;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="닫기"
        tabIndex={-1}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {panel}
    </div>
  );
}
