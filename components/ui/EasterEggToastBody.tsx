"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import type { ChatMsg } from "./easter-egg-toast-types";
import { QUICK_CHIPS } from "./easter-egg-toast-types";

export function BuddyAvatar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <rect x="10" y="22" width="44" height="32" rx="10" className="fill-brand" />
      <rect
        x="18"
        y="14"
        width="28"
        height="12"
        rx="4"
        className="fill-brand-strong"
      />
      <circle cx="24" cy="36" r="4" className="fill-surface-white" />
      <circle cx="40" cy="36" r="4" className="fill-surface-white" />
      <circle cx="24" cy="36" r="1.8" className="fill-ink-heading" />
      <circle cx="40" cy="36" r="1.8" className="fill-ink-heading" />
      <path
        d="M26 46c2.5 3 9.5 3 12 0"
        className="stroke-surface-white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M32 14V8"
        className="stroke-brand-strong"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="6" r="3" className="fill-amber-300" />
    </svg>
  );
}

function BuddyTypingBubble() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="버디가 답변 생성 중"
      className="self-start animate-fade-up"
    >
      <div className="flex items-end gap-2">
        <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand/20 bg-surface-white shadow-sm">
          <BuddyAvatar className="h-5 w-5" />
        </div>
        <div className="relative min-w-[7.5rem] rounded-2xl rounded-bl-md bg-surface-soft px-3.5 py-2.5">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl rounded-bl-md"
          >
            <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-brand/12 to-transparent motion-safe:animate-shimmer" />
          </span>
          <div className="relative flex flex-col gap-1.5">
            <div className="flex h-6 items-end gap-1.5 pb-0.5" aria-hidden>
              <i className="buddy-typing-dot" />
              <i className="buddy-typing-dot" />
              <i className="buddy-typing-dot" />
            </div>
            <span className="text-[11px] font-semibold tracking-wide text-ink-caption animate-buddy-think">
              생각 중…
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverlayLayer({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

type Props = {
  toast: string | null;
  buddyVisible: boolean;
  bubble: string | null;
  chatOpen: boolean;
  messages: ChatMsg[];
  draft: string;
  sending: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
  onOpenChat: () => void;
  onDismissBuddy: () => void;
  onCloseChat: () => void;
  onDraftChange: (value: string) => void;
  onSendUser: (text: string) => void;
};

/** 토스트·버디 플로트·챗 시트 오버레이. */
export function EasterEggToastBody({
  toast,
  buddyVisible,
  bubble,
  chatOpen,
  messages,
  draft,
  sending,
  chatEndRef,
  onOpenChat,
  onDismissBuddy,
  onCloseChat,
  onDraftChange,
  onSendUser,
}: Props) {
  return (
    <OverlayLayer>
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[80] flex justify-center px-4"
        >
          <p className="w-full max-w-mobile rounded-2xl border border-line-soft bg-ink-heading/90 px-4 py-2.5 text-center text-sm font-semibold text-surface-white shadow-soft">
            {toast}
          </p>
        </div>
      ) : null}

      {buddyVisible ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center">
          <div className="relative w-full max-w-mobile">
            <div className="absolute bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3 flex max-w-[min(100%,18rem)] flex-col items-end gap-2">
              {bubble ? (
                <div
                  role="status"
                  className="animate-fade-up rounded-2xl rounded-br-md border border-line-soft bg-surface-white px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-ink-heading shadow-soft"
                >
                  {bubble}
                </div>
              ) : null}
              <div className="pointer-events-auto relative">
                <button
                  type="button"
                  onClick={onOpenChat}
                  aria-label="MetU 버디와 대화하기"
                  className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand/30 bg-surface-white shadow-glow transition-transform active:scale-95 animate-buddy-pop"
                >
                  <BuddyAvatar className="h-12 w-12 motion-safe:animate-float-soft" />
                </button>
                <button
                  type="button"
                  onClick={onDismissBuddy}
                  aria-label="버디 닫기"
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-line-soft bg-surface-white text-ink-caption shadow-sm active:scale-95"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.6} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {chatOpen ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 bg-ink-heading/35 backdrop-blur-[2px]"
            onClick={onCloseChat}
          />
          <div className="relative z-10 flex h-[min(78dvh,640px)] w-full max-w-mobile flex-col rounded-t-[28px] border border-line-soft bg-surface-white shadow-lg animate-fade-up">
            <div className="flex items-center gap-3 border-b border-line-soft px-4 py-3">
              <BuddyAvatar className="h-10 w-10 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-ink-heading">
                  MetU 버디
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseChat}
                aria-label="챗봇 닫기"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-caption active:bg-surface-soft"
              >
                <X className="h-5 w-5" strokeWidth={2.2} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={[
                    "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "buddy"
                      ? "self-start rounded-bl-md bg-surface-soft text-ink-body"
                      : "self-end rounded-br-md bg-brand text-surface-white",
                  ].join(" ")}
                >
                  {msg.text}
                </div>
              ))}
              {sending ? <BuddyTypingBubble /> : null}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 pb-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  disabled={sending}
                  onClick={() => void onSendUser(chip.label)}
                  className="shrink-0 rounded-full border border-line-soft bg-surface-base px-3 py-1.5 text-xs font-bold text-brand active:bg-surface-soft disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                const text = draft;
                onDraftChange("");
                void onSendUser(text);
              }}
              className="flex gap-2 border-t border-line-soft px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
            >
              <input
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                disabled={sending}
                placeholder="무엇이든 물어보세요…"
                className="min-w-0 flex-1 rounded-xl2 border border-line-soft bg-surface-base px-3.5 py-2.5 text-sm text-ink-heading outline-none placeholder:text-ink-caption focus:border-brand/40 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="shrink-0 rounded-xl2 bg-brand px-4 py-2.5 text-sm font-bold text-surface-white active:brightness-95 disabled:opacity-50"
              >
                전송
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </OverlayLayer>
  );
}
