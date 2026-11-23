"use client";

import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function PartyChatNotPartyState({
  listHref,
}: {
  listHref: "/opod" | "/board";
}) {
  const router = useRouter();
  return (
    <MobileShell title="동행 채팅" showBack backHref={listHref}>
      <div className="flex flex-col items-center gap-4 px-5 py-20 text-center">
        <p className="text-base font-bold text-ink-heading">
          동행 모집 글에서만 채팅을 사용할 수 있어요.
        </p>
        <PrimaryButton
          fullWidth={false}
          className="px-6"
          onClick={() => router.push(listHref)}
        >
          목록으로 돌아가기
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}

export function PartyChatGuestState({
  listHref,
}: {
  listHref: "/opod" | "/board";
}) {
  const router = useRouter();
  return (
    <MobileShell title="동행 채팅" showBack backHref={listHref}>
      <div className="flex flex-col items-center gap-4 px-5 py-20 text-center">
        <p className="text-base font-bold text-ink-heading">
          채팅은 로그인한 동행 멤버만 사용할 수 있어요.
        </p>
        <PrimaryButton
          fullWidth={false}
          className="px-6"
          onClick={() => router.push("/login")}
        >
          로그인하러 가기
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}

export function PartyChatBlockedState({
  listHref,
  postId,
  isPending,
}: {
  listHref: "/opod" | "/board";
  postId: string;
  isPending: boolean;
}) {
  const router = useRouter();
  return (
    <MobileShell title="동행 채팅" showBack backHref={listHref}>
      <div className="flex flex-col items-center gap-4 px-5 py-20 text-center">
        <p className="text-base font-bold text-ink-heading">
          {isPending
            ? "호스트 승인 후 채팅방에 입장할 수 있어요."
            : "동행 참여가 수락된 뒤에 채팅방에 입장할 수 있어요."}
        </p>
        <PrimaryButton
          fullWidth={false}
          className="px-6"
          onClick={() => router.push(`${listHref}/${postId}`)}
        >
          동행 글로 이동
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}
