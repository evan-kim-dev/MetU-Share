"use client";

import type { RefObject } from "react";
import { Plus, Send } from "lucide-react";

export function PartyChatComposeBar({
  draft,
  setDraft,
  sending,
  attachError,
  fileInputRef,
  onAttachSelected,
  onSend,
}: {
  draft: string;
  setDraft: (v: string) => void;
  sending: boolean;
  attachError: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onAttachSelected: (file: File) => void;
  onSend: () => void;
}) {
  return (
    <div className="border-t border-line-soft bg-surface-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
      {attachError ? (
        <p className="mb-2 text-xs text-red-500">{attachError}</p>
      ) : null}
      <div className="flex items-stretch gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
          className="hidden"
          disabled={sending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) {
              onAttachSelected(file);
            }
          }}
        />
        <button
          type="button"
          aria-label="사진 또는 파일 첨부"
          disabled={sending}
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-control w-10 shrink-0 items-center justify-center self-stretch rounded-xl border border-line-soft bg-surface-soft text-ink-body transition-all hover:bg-surface-base active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
        </button>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={1}
          placeholder="메시지를 입력하세요"
          disabled={sending}
          className="min-h-control max-h-28 min-w-0 flex-1 resize-none rounded-xl border border-line-soft px-3 py-2 text-sm leading-5 text-ink-body outline-none focus:border-brand"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button
          type="button"
          aria-label="메시지 전송"
          disabled={!draft.trim() || sending}
          onClick={onSend}
          className="flex min-h-control w-10 shrink-0 items-center justify-center self-stretch rounded-xl bg-brand text-surface-white shadow-soft transition-all hover:brightness-105 active:brightness-95 disabled:cursor-not-allowed disabled:bg-line-muted disabled:text-surface-white/80 disabled:shadow-none"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
