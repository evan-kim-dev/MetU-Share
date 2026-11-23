"use client";

import { useRouter } from "next/navigation";
import { AuthorAvatarLink } from "@/components/community/AuthorAvatarLink";
import { isAvatarImage } from "@/lib/profile/public";
import type { FriendSummary } from "@/lib/friends/supabase";

interface CommunityFriendsSectionProps {
  friendsReady: boolean;
  friends: FriendSummary[];
}

export function CommunityFriendsSection({
  friendsReady,
  friends,
}: CommunityFriendsSectionProps) {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-heading font-extrabold leading-7 tracking-tight text-ink-heading">
        친구
      </h2>
      {!friendsReady ? (
        <p className="mt-2 text-xs text-ink-caption">친구 불러오는 중...</p>
      ) : friends.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-ink-caption">
          게시글에서 친구를 추가하고, 상대가 수락하면 여기에 보여요.
        </p>
      ) : (
        <div className="mt-1 overflow-hidden rounded-2xl border-0 bg-surface-white shadow-sm">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between gap-3 border-b border-line-soft px-3 py-3 last:border-b-0"
            >
              <AuthorAvatarLink
                userId={friend.id}
                name={friend.name}
                avatar={
                  isAvatarImage(friend.avatar) ? friend.avatar : friend.avatar
                }
                size="sm"
                showName
                className="min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={() => router.push(`/opod/dm/${friend.id}`)}
                className="shrink-0 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand active:bg-brand/15"
              >
                채팅
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}