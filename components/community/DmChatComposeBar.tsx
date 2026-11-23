"use client";

import type { RefObject } from "react";
import { Plus, Send } from "lucide-react";

export function DmChatComposeBar({
  draft,
  setDraft,
  sending,
  threadId,
  attachError,
  error,
  fileInputRef,
  onAttachSelected,
  onSend,
}: {
  draft: string;
  setDraft: (v: string) => void;
  sending: boolean;
  threadId: string | null;
  attachError: string;
  error: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onAttachSelected: (file: File) => void;
  onSend: () => void;
}) {
  return (
    <div className="border-t border-line-soft bg-surface-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
      {attachError ? (
        <p className="mb-2 text-xs text-danger">{attachError}</p>
      ) : null}
      {error ? (
        <p className="mb-2 text-xs font-medium text-danger">{error}</p>
      ) : null}
      <div className="flex items-stretch gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
          className="hidden"
          disabled={sending || !threadId}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onAttachSelected(file);
          }}
        />
        <button
          type="button"
          aria-label="사진 또는 파일 첨부"
          disabled={sending || !threadId}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl2 border border-line-soft bg-surface-soft text-ink-body active:bg-surface-base disabled:opacity-50"
        >
          <Plus className="h-5 w-5" strokeWidth={2.4} />
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={sending || !threadId}
          maxLength={1000}
          placeholder="메시지 입력…"
          className="min-w-0 flex-1 rounded-xl2 border border-line-soft bg-surface-base px-3.5 py-2.5 text-sm text-ink-heading outline-none placeholder:text-ink-caption focus:border-brand/40 disabled:opacity-60"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button
          type="button"
          disabled={sending || !threadId || !draft.trim()}
          aria-label="전송"
          onClick={onSend}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl2 bg-brand text-surface-white active:brightness-95 disabled:opacity-50"
        >
          <Send className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}