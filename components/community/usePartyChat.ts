"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  useCommunityActions,
  useCommunityState,
} from "@/lib/community/CommunityProvider";
import {
  fetchPartyChatMessages,
  sendPartyChatMessage,
  subscribePartyChatMessages,
  type PartyChatMessage,
} from "@/lib/community/chat-supabase";
import {
  appendLocalPartyChatMessage,
  createLocalPartyChatMessage,
  loadLocalPartyChatMessages,
  mergePartyChatMessages,
} from "@/lib/community/chat-storage";
import { markChatSeen } from "@/lib/community/chat-notice";
import {
  formatPartyChatAttachmentMessage,
  uploadPartyChatAttachment,
} from "@/lib/community/chat-attachments";
import { useProfile } from "@/lib/profile/ProfileProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function usePartyChat(postId: string) {
  const { user, provider } = useAuth();
  const { profile } = useProfile();
  const { posts } = useCommunityState();
  const { isPartyHost, isPartyJoined, isPartyPending } = useCommunityActions();
  const post = useMemo(
    () => posts.find((item) => item.id === postId),
    [postId, posts]
  );
  const [messages, setMessages] = useState<PartyChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachError, setAttachError] = useState("");

  const isPartyPost = Boolean(post && post.category === "party" && post.party);
  const canChat = useMemo(() => {
    if (!post || !isPartyPost) return false;
    return isPartyHost(post) || isPartyJoined(post);
  }, [isPartyHost, isPartyJoined, isPartyPost, post]);
  const isPending = Boolean(post && isPartyPost && isPartyPending(post));

  useEffect(() => {
    if (!post || !isPartyPost || !canChat) {
      setLoading(false);
      return;
    }

    const currentPostId = post.id;
    const supabaseClient = getBrowserSupabase();
    let mounted = true;

    async function load() {
      const remote = supabaseClient
        ? await fetchPartyChatMessages(supabaseClient, currentPostId)
        : [];
      const local = loadLocalPartyChatMessages(currentPostId);
      if (mounted) {
        setMessages(mergePartyChatMessages(remote, local));
        setLoading(false);
        markChatSeen(currentPostId);
      }
    }

    void load();

    if (!supabaseClient) {
      return () => {
        mounted = false;
        markChatSeen(currentPostId);
      };
    }

    const sb: NonNullable<typeof supabaseClient> = supabaseClient;
    const channel = subscribePartyChatMessages(sb, currentPostId, (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      mounted = false;
      markChatSeen(currentPostId);
      void sb.removeChannel(channel);
    };
  }, [canChat, isPartyPost, post]);

  useEffect(() => {
    if (!post?.id || !canChat) return;
    markChatSeen(post.id);
  }, [canChat, messages, post?.id]);

  async function sendMessage(text: string) {
    if (!text || !post || !user?.id) return;

    const supabase = getBrowserSupabase();
    if (supabase) {
      const sent = await sendPartyChatMessage(supabase, {
        postId: post.id,
        senderId: user.id,
        senderName: profile.name,
        senderAvatar: profile.avatarUrl || "💬",
        message: text,
      });

      if (sent) {
        setMessages((prev) => {
          if (prev.some((message) => message.id === sent.id)) return prev;
          return [...prev, sent];
        });
        return;
      }
    }

    const localMessage = createLocalPartyChatMessage({
      postId: post.id,
      senderId: user.id,
      senderName: profile.name,
      senderAvatar: profile.avatarUrl || "💬",
      message: text,
    });
    appendLocalPartyChatMessage(localMessage);
    setMessages((prev) => [...prev, localMessage]);
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setDraft("");
    setAttachError("");
    await sendMessage(text);
    setSending(false);
  }

  async function handleAttachSelected(file: File) {
    if (!post || !user?.id || sending) return;

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setAttachError("파일 전송은 Supabase 연결이 필요해요.");
      return;
    }

    setSending(true);
    setAttachError("");

    const uploaded = await uploadPartyChatAttachment(supabase, {
      postId: post.id,
      userId: user.id,
      file,
    });

    if ("error" in uploaded) {
      setAttachError(uploaded.error);
      setSending(false);
      return;
    }

    await sendMessage(
      formatPartyChatAttachmentMessage({
        type: uploaded.type,
        url: uploaded.url,
        fileName: uploaded.fileName,
      })
    );
    setSending(false);
  }

  return {
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
  };
}
