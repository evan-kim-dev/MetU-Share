"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/lib/auth/AuthProvider";
import type { SplitChatMessage, SplitPreviewPayload } from "@/lib/ledger/split-chat";
import { uploadSplitChatAttachment } from "@/lib/ledger/split-chat-attachments";
import { subscribeSplitChatMessages } from "@/lib/ledger/split-chat-client";
import { getBrowserSupabase } from "@/lib/supabase/browser";

import {
  type SplitChatConfirmResponse,
  type SplitChatListResponse,
  type SplitChatMember,
  type SplitChatRoomProps,
  type SplitChatSendResponse,
} from "./split-chat-room-types";
import { mergeSplitChatMessages } from "./split-chat-room-utils";

export function useSplitChatRoom({
  tripId,
  members = [],
  variant = "inline",
  open = true,
}: Pick<SplitChatRoomProps, "tripId" | "members" | "variant" | "open">) {
  const { user, isAnonymous } = useAuth();
  const myId = user?.id ?? null;
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SplitChatMessage[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inline = variant === "inline";

  const memberByUserId = useMemo(() => {
    const map = new Map<string, SplitChatMember>();
    for (const m of members) {
      if (m.userId) map.set(m.userId, m);
    }
    return map;
  }, [members]);

  const headerNames = useMemo(() => {
    const names = members.map((m) => m.displayName.trim()).filter(Boolean);
    return [...names, "MetU"];
  }, [members]);

  const headerSubtitle = useMemo(() => {
    const n = headerNames.length;
    if (n <= 1) return "MetU AI";
    const shown = headerNames.slice(0, 3).join(", ");
    const more = n > 3 ? ` 외 ${n - 3}명` : "";
    return `${shown}${more} · ${n}명`;
  }, [headerNames]);

  const exampleName = useMemo(() => {
    const other = members.find((m) => m.userId !== myId);
    return other?.displayName.trim() || "민수";
  }, [members, myId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/trips/${tripId}/split-chat`, {
        credentials: "include",
      });
      const json = (await res.json()) as SplitChatListResponse;
      if (!res.ok || !json.ok || !json.threadId) {
        setError("대화방을 불러오지 못했어요.");
        return;
      }
      setThreadId(json.threadId);
      setMessages(json.messages ?? []);
    } catch {
      setError("대화방을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open || !threadId) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const channel = subscribeSplitChatMessages(supabase, threadId, (msg) => {
      setMessages((prev) => mergeSplitChatMessages(prev, msg));
    });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [open, threadId]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open || inline) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open, inline]);

  async function postChat(body: {
    text?: string;
    attachment?: { kind: "image" | "file"; url: string; fileName: string };
  }) {
    const res = await fetch(`/api/trips/${tripId}/split-chat`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as SplitChatSendResponse;
    if (!res.ok || !json.ok) {
      throw new Error("send-failed");
    }
    if (json.threadId) setThreadId(json.threadId);
    if (json.userMessage) {
      setMessages((prev) => mergeSplitChatMessages(prev, json.userMessage!));
    }
    if (json.agentMessage) {
      setMessages((prev) => mergeSplitChatMessages(prev, json.agentMessage!));
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError("");
    setText("");
    try {
      await postChat({ text: trimmed });
    } catch {
      setError("메시지를 보내지 못했어요.");
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  async function handleAttachSelected(file: File) {
    if (sending || !myId) return;
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("파일 전송은 로그인 연결이 필요해요.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const uploaded = await uploadSplitChatAttachment(supabase, {
        tripId,
        userId: myId,
        file,
      });
      if ("error" in uploaded) {
        setError(uploaded.error);
        return;
      }
      const caption = text.trim();
      setText("");
      await postChat({
        text: caption || undefined,
        attachment: {
          kind: uploaded.kind,
          url: uploaded.url,
          fileName: uploaded.fileName,
        },
      });
    } catch {
      setError("파일을 보내지 못했어요.");
    } finally {
      setSending(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleConfirm(
    message: SplitChatMessage,
    payload: SplitPreviewPayload
  ) {
    setConfirmingId(message.id);
    setError("");
    try {
      const res = await fetch(`/api/trips/${tripId}/split-chat/confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message.id,
          beforeDigest: payload.beforeDigest,
          idempotencyKey: payload.idempotencyKey,
        }),
      });
      const json = (await res.json()) as SplitChatConfirmResponse;
      if (!res.ok || !json.ok) {
        setError(json.message ?? "반영하지 못했어요. 다시 시도해 주세요.");
        return;
      }
      setDismissed((prev) => new Set(prev).add(message.id));
      if (json.systemMessage) {
        setMessages((prev) => mergeSplitChatMessages(prev, json.systemMessage!));
      }
    } catch {
      setError("반영하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setConfirmingId(null);
    }
  }

  function resolveSenderName(m: SplitChatMessage): string {
    if (m.senderKind === "agent") return "MetU";
    if (m.senderKind === "system") return "시스템";
    if (m.senderUserId) {
      const hit = memberByUserId.get(m.senderUserId);
      if (hit?.displayName) return hit.displayName;
    }
    return m.senderName || "여행자";
  }

  function dismissPreview(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  const stackMembers = members.slice(0, 3);

  return {
    myId,
    isAnonymous: Boolean(isAnonymous),
    members,
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
  };
}
