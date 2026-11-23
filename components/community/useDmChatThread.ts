"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useFriends } from "@/lib/friends/FriendsProvider";
import { useProfile } from "@/lib/profile/ProfileProvider";
import { markDmChatSeen } from "@/lib/community/chat-notice";
import {
  dmMessagePreview,
  formatDmChatAttachmentMessage,
  uploadDmChatAttachment,
} from "@/lib/dm/dm-attachments";
import {
  fetchDmMessages,
  getOrCreateDmThread,
  notifyDmMessage,
  sendDmMessage,
  subscribeDmMessages,
  type DmMessage,
} from "@/lib/dm/dm-supabase";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function useDmChatThread(peerId: string) {
  const { user, provider } = useAuth();
  const { profile } = useProfile();
  const { isFriend, friends, isReady: friendsReady } = useFriends();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [attachError, setAttachError] = useState("");

  const me = user?.id ?? null;
  const isGuest = provider === "guest";
  const peer = useMemo(
    () => friends.find((friend) => friend.id === peerId),
    [friends, peerId]
  );
  const peerName = peer?.name ?? "친구";
  const peerAvatar = peer?.avatar ?? "👤";
  const canChat = Boolean(me && !isGuest && friendsReady && isFriend(peerId));

  const displayMessages = useMemo(
    () =>
      messages.map((message) => {
        if (message.senderName !== "여행자") return message;
        if (message.senderId === me) {
          return {
            ...message,
            senderName: profile.name || "나",
            senderAvatar: profile.avatarUrl || message.senderAvatar,
          };
        }
        if (message.senderId === peerId) {
          return {
            ...message,
            senderName: peerName,
            senderAvatar: peerAvatar,
          };
        }
        return message;
      }),
    [me, messages, peerAvatar, peerId, peerName, profile.avatarUrl, profile.name]
  );

  useEffect(() => {
    if (!me || isGuest || !friendsReady) {
      setLoading(false);
      return;
    }
    if (!isFriend(peerId)) {
      setLoading(false);
      setError("친구가 된 상대와만 1:1 채팅할 수 있어요.");
      return;
    }

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setLoading(false);
      setError("Supabase 연결이 필요해요.");
      return;
    }

    let mounted = true;
    setLoading(true);
    setError("");

    async function boot() {
      const thread = await getOrCreateDmThread(supabase!, me!, peerId);
      if (!mounted) return;
      if (!thread) {
        setError("채팅방을 만들지 못했어요. 친구 상태를 확인해 주세요.");
        setLoading(false);
        return;
      }

      setThreadId(thread.id);
      const remote = await fetchDmMessages(supabase!, thread.id);
      if (!mounted) return;
      setMessages(remote);
      setLoading(false);
      markDmChatSeen(thread.id);
    }

    void boot();

    return () => {
      mounted = false;
    };
  }, [friendsReady, isFriend, isGuest, me, peerId]);

  useEffect(() => {
    if (!threadId) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    const channel = subscribeDmMessages(supabase, threadId, (message) => {
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      markDmChatSeen(threadId);
      void supabase.removeChannel(channel);
    };
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;
    markDmChatSeen(threadId);
  }, [displayMessages, threadId]);

  async function deliverMessage(text: string) {
    if (!me || !threadId) return false;
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Supabase 연결이 필요해요.");
      return false;
    }

    const sent = await sendDmMessage(supabase, {
      threadId,
      senderId: me,
      senderName: profile.name,
      senderAvatar: profile.avatarUrl || "💬",
      message: text,
    });

    if (!sent) {
      setError("메시지를 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
      return false;
    }

    setMessages((prev) => {
      if (prev.some((message) => message.id === sent.id)) return prev;
      return [...prev, sent];
    });

    void notifyDmMessage(supabase, {
      recipientId: peerId,
      actorId: me,
      actorName: profile.name || "친구",
      threadId,
      preview: dmMessagePreview(text),
    });

    return true;
  }

  async function handleSend(draft: string, setDraft: (v: string) => void) {
    const text = draft.trim();
    if (!text || sending || !threadId) return;

    setSending(true);
    setDraft("");
    setError("");
    setAttachError("");
    const ok = await deliverMessage(text);
    if (!ok) setDraft(text);
    setSending(false);
  }

  async function handleAttachSelected(file: File) {
    if (!me || !threadId || sending) return;
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setAttachError("파일 전송은 Supabase 연결이 필요해요.");
      return;
    }

    setSending(true);
    setAttachError("");
    setError("");

    const uploaded = await uploadDmChatAttachment(supabase, {
      threadId,
      userId: me,
      file,
    });

    if ("error" in uploaded) {
      setAttachError(uploaded.error);
      setSending(false);
      return;
    }

    const message = formatDmChatAttachmentMessage({
      type: uploaded.type,
      url: uploaded.url,
      fileName: uploaded.fileName,
    });
    const ok = await deliverMessage(message);
    if (!ok) setAttachError("첨부는 올렸지만 메시지 전송에 실패했어요.");
    setSending(false);
  }

  return {
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
  };
}