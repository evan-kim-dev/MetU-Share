"use client";

import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  Wallet,
} from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SafeAvatar } from "@/components/ui/SafeAvatar";
import { formatPartyDateRange } from "@/components/community/usePostDetailActions";
import { formatPartyBudgetPerPerson } from "@/lib/community/format";
import type { CommunityPost, PartyMember } from "@/lib/community/types";

interface PostDetailPartySectionProps {
  post: CommunityPost;
  listHref: "/opod" | "/board";
  isHost: boolean;
  joined: boolean;
  pending: boolean;
  isFull: boolean;
  slotsLeft: number;
  needsLogin: boolean;
  pendingMembers: PartyMember[];
  onLeaveParty: (postId: string) => void;
  onCancelJoinRequest: (postId: string) => void;
  onAcceptJoin: (postId: string, memberId: string) => void;
  onRejectJoin: (postId: string, memberId: string) => void;
  onJoinRequest: () => void;
}

export function PostDetailPartySection({
  post,
  listHref,
  isHost,
  joined,
  pending,
  isFull,
  slotsLeft,
  needsLogin,
  pendingMembers,
  onLeaveParty,
  onCancelJoinRequest,
  onAcceptJoin,
  onRejectJoin,
  onJoinRequest,
}: PostDetailPartySectionProps) {
  const router = useRouter();
  const party = post.party;
  if (!party) return null;

  return (
    <section className="rounded-2xl border border-brand/20 bg-surface-soft p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold text-brand-strong">동행 모집 정보</p>
        <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">
          {party.current}/{party.needed}명
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 text-sm font-semibold text-ink-heading">
        <p className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          {formatPartyDateRange(party.startDate, party.endDate)}
        </p>
        <p className="inline-flex items-center gap-2">
          <Users className="h-4 w-4" />
          {party.needed - party.current}명 더 모집 중
        </p>
        {party.budgetPerPerson ? (
          <p className="inline-flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            1인 예산 {formatPartyBudgetPerPerson(party.budgetPerPerson)}
          </p>
        ) : null}
      </div>

      <div className="mt-4 border-t border-brand/20 pt-3">
        <p className="mb-2 text-xs font-bold text-brand-strong">참여 멤버</p>
        <ul className="flex flex-col gap-2">
          {party.members.map((member) => (
            <li
              key={member.id}
              className="flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-2"
            >
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-brand/10 text-sm">
                <SafeAvatar src={member.avatar} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-heading">
                  {member.name}
                  {member.isHost ? (
                    <span className="ml-1.5 text-2xs font-bold text-brand">
                      HOST
                    </span>
                  ) : null}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isHost && pendingMembers.length > 0 ? (
        <div className="mt-4 border-t border-brand/20 pt-3">
          <p className="mb-2 text-xs font-bold text-brand-strong">
            참여 요청 ({pendingMembers.length})
          </p>
          <ul className="flex flex-col gap-2">
            {pendingMembers.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-2"
              >
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-brand/10 text-sm">
                  <SafeAvatar src={member.avatar} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-heading">
                    {member.name}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAcceptJoin(post.id, member.id)}
                    disabled={isFull}
                    className="rounded-md bg-brand px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                  >
                    수락
                  </button>
                  <button
                    type="button"
                    onClick={() => onRejectJoin(post.id, member.id)}
                    className="rounded-md border border-line-soft bg-white px-2.5 py-1.5 text-xs font-bold text-ink-body"
                  >
                    거절
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4">
        {isHost ? (
          <p className="rounded-lg bg-white/80 px-3 py-2.5 text-center text-sm font-semibold text-brand-strong">
            내가 모집 중인 동행이에요
          </p>
        ) : joined ? (
          <button
            type="button"
            onClick={() => onLeaveParty(post.id)}
            className="w-full rounded-lg border border-line-soft bg-white py-3 text-sm font-bold text-brand-strong"
          >
            참여 취소
          </button>
        ) : pending ? (
          <div className="flex flex-col gap-2">
            <p className="rounded-lg bg-white/80 px-3 py-2.5 text-center text-sm font-semibold text-brand-strong">
              요청 대기 중 · 호스트 승인을 기다려 주세요
            </p>
            <button
              type="button"
              onClick={() => onCancelJoinRequest(post.id)}
              className="w-full rounded-lg border border-line-soft bg-white py-3 text-sm font-bold text-ink-body"
            >
              요청 취소
            </button>
          </div>
        ) : isFull ? (
          <p className="rounded-lg bg-ink-caption/10 px-3 py-2.5 text-center text-sm font-semibold text-ink-caption">
            모집이 마감됐어요
          </p>
        ) : (
          <PrimaryButton
            className="h-11 min-h-tap rounded-xl bg-brand text-sm"
            onClick={onJoinRequest}
          >
            {needsLogin
              ? "로그인 후 참여 요청"
              : `참여 요청하기 (${slotsLeft}명 남음)`}
          </PrimaryButton>
        )}
      </div>

      {isHost || joined ? (
        <button
          type="button"
          onClick={() => router.push(`${listHref}/${post.id}/chat`)}
          className="mt-2 w-full rounded-lg bg-brand-strong py-3 text-sm font-bold text-white"
        >
          오픈채팅방 입장
        </button>
      ) : null}
    </section>
  );
}