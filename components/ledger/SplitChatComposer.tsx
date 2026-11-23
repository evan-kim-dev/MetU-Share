"use client";

import { Paperclip, Send } from "lucide-react";
import type { FormEvent, RefObject } from "react";

type Props = {
  text: string;
  onTextChange: (v: string) => void;
  sending: boolean;
  myId: string | null;
  exampleName: string;
  error: string;
  inputRef: RefObject<HTMLInputElement | null>;
  fileRef: RefObject<HTMLInputElement | null>;
  onSend: (e: FormEvent) => void;
  onAttachSelected: (file: File) => void;
};

export function SplitChatComposer({
  text,
  onTextChange,
  sending,
  myId,
  exampleName,
  error,
  inputRef,
  fileRef,
  onSend,
  onAttachSelected,
}: Props) {
  return (
    <>
      {error ? (
        <p
          role="alert"
          className="shrink-0 bg-mu-card px-3 py-1 text-mu-caption text-mu-err"
        >
          {error}
        </p>
      ) : null}

      <form
        onSubmit={onSend}
        className="flex shrink-0 items-center gap-2 border-t border-mu-line bg-mu-card px-3 py-2"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onAttachSelected(file);
          }}
        />
        <button
          type="button"
          disabled={sending || !myId}
          className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-full text-mu-fg-2 disabled:opacity-40"
          aria-label="사진·파일 첨부"
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" aria-hidden />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          maxLength={2000}
          placeholder={`${exampleName} 빼고…`}
          disabled={sending}
          className="min-h-tap flex-1 rounded-full border border-mu-line bg-mu-bg px-4 text-mu-body text-mu-fg outline-none focus:border-mu-accent"
          aria-label="분담 메시지"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-full bg-mu-accent text-mu-on-accent disabled:opacity-40"
          aria-label="보내기"
        >
          <Send className="h-5 w-5" aria-hidden />
        </button>
      </form>
    </>
  );
}
