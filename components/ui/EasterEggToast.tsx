"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  ChatMsg,
  EasterEggContextValue,
} from "./easter-egg-toast-types";
import { TOAST_MS } from "./easter-egg-toast-types";
import { pickReply } from "./easter-egg-toast-utils";
import { EasterEggToastBody } from "./EasterEggToastBody";

const EasterEggContext = createContext<EasterEggContextValue | null>(null);

export function EasterEggToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);
  const [buddyVisible, setBuddyVisible] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const bubbleTimer = useRef<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<ChatMsg[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const showToast = useCallback((next: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = window.setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, TOAST_MS);
  }, []);

  const summonBuddy = useCallback((greeting?: string) => {
    const line =
      greeting ??
      pickReply([
        "어 나야. MetU 버디. 뭐든지 말해봐.",
        "숨은 메뉴 찾았네. 심심하면 말 걸든가.",
        "왔어? 태도 따라 나도 바뀜. 알아서 해.",
      ]);
    setBuddyVisible(true);
    setBubble(line);
    if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => {
      setBubble(null);
      bubbleTimer.current = null;
    }, 4500);
  }, []);

  const dismissBuddy = useCallback(() => {
    setBuddyVisible(false);
    setChatOpen(false);
    setBubble(null);
    setDraft("");
    setSending(false);
    setMessages([]);
  }, []);

  const openChat = useCallback(() => {
    setChatOpen(true);
    setBubble(null);
    setMessages((prev) =>
      prev.length > 0
        ? prev
        : [
            {
              id: "hello",
              role: "buddy",
              text: "나 MetU 버디. 뭐든 물어봐.",
            },
          ]
    );
  }, []);

  const sendUser = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const userMsg: ChatMsg = {
        id: `u-${Date.now()}`,
        role: "user",
        text: trimmed,
      };
      const historyForApi = [...messagesRef.current, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      setMessages((prev) => [...prev, userMsg]);
      setSending(true);

      const buddyId = `b-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: buddyId, role: "buddy", text: "" },
      ]);

      try {
        const res = await fetch("/api/buddy-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: historyForApi.slice(0, -1),
          }),
        });
        if (!res.ok) throw new Error(`buddy-failed:${res.status}`);

        const { collectStreamedContent } = await import("@/lib/ai/stream-chat");
        const result = await collectStreamedContent(res, (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === buddyId ? { ...m, text: m.text + token } : m
            )
          );
        });
        const reply = result?.content?.trim();
        if (!reply) throw new Error("empty-reply");
        setMessages((prev) =>
          prev.map((m) => (m.id === buddyId ? { ...m, text: reply } : m))
        );
      } catch {
        // Gemini 키가 없거나 호출 실패하면 여기로 떨어짐 (가드레일 아님)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === buddyId
              ? {
                  ...m,
                  text: "지금 AI랑 연결이 안 됐어. 잠시 후 다시 말 걸어봐.",
                }
              : m
          )
        );
      } finally {
        setSending(false);
      }
    },
    [sending]
  );

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!chatOpen) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatOpen]);

  const value = useMemo(
    () => ({ showToast, summonBuddy }),
    [showToast, summonBuddy]
  );

  return (
    <EasterEggContext.Provider value={value}>
      {children}
      <EasterEggToastBody
        toast={toast}
        buddyVisible={buddyVisible}
        bubble={bubble}
        chatOpen={chatOpen}
        messages={messages}
        draft={draft}
        sending={sending}
        chatEndRef={chatEndRef}
        onOpenChat={openChat}
        onDismissBuddy={dismissBuddy}
        onCloseChat={() => setChatOpen(false)}
        onDraftChange={setDraft}
        onSendUser={(text) => void sendUser(text)}
      />
    </EasterEggContext.Provider>
  );
}

export function useEasterEggToast() {
  const ctx = useContext(EasterEggContext);
  if (!ctx) {
    return {
      showToast: (_message: string) => {},
      summonBuddy: (_greeting?: string) => {},
    };
  }
  return ctx;
}

export function useSecretTap(params: {
  tapsRequired: number;
  windowMs?: number;
  onTrigger: () => void;
  onceKey?: string;
}) {
  const { tapsRequired, windowMs = 3000, onTrigger, onceKey } = params;
  const countRef = useRef(0);
  const firstTapRef = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - firstTapRef.current > windowMs) {
      countRef.current = 0;
      firstTapRef.current = now;
    }

    countRef.current += 1;
    if (countRef.current < tapsRequired) return;

    countRef.current = 0;
    firstTapRef.current = 0;

    if (onceKey && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(onceKey, "1");
      } catch {
        /* ignore */
      }
    }

    onTrigger();
  }, [tapsRequired, windowMs, onTrigger, onceKey]);
}
