"use client";

import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface PostDetailLoadingStateProps {
  listHref: "/opod" | "/board";
}

export function PostDetailLoadingState({ listHref }: PostDetailLoadingStateProps) {
  return (
    <MobileShell title="게시글" showBack backHref={listHref}>
      <div className="flex flex-col items-center gap-4 px-5 py-20 text-center">
        <p className="text-sm text-ink-caption">게시글을 불러오는 중이에요…</p>
      </div>
    </MobileShell>
  );
}

interface PostDetailNotFoundStateProps {
  listHref: "/opod" | "/board";
}

export function PostDetailNotFoundState({ listHref }: PostDetailNotFoundStateProps) {
  const router = useRouter();

  return (
    <MobileShell title="게시글" showBack backHref={listHref}>
      <div className="flex flex-col items-center gap-4 px-5 py-20 text-center">
        <p className="text-base font-bold text-ink-heading">
          게시글을 찾을 수 없어요
        </p>
        <PrimaryButton
          fullWidth={false}
          className="px-6"
          onClick={() => router.push(listHref)}
        >
          {listHref === "/board" ? "게시판으로 돌아가기" : "멧톡으로 돌아가기"}
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}