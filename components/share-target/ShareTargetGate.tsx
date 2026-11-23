"use client";

import Link from "next/link";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { shareTargetLoginNext } from "@/lib/ledger/share-target-next";

export function ShareTargetLoading() {
  return (
    <div
      className="m-4 h-48 animate-pulse rounded-2xl bg-mu-sunken"
      aria-busy
    />
  );
}

export function ShareTargetGuestGate({
  searchParams,
}: {
  searchParams: ReadonlyURLSearchParams;
}) {
  const loginNext = shareTargetLoginNext(searchParams);
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-3 px-4 py-8">
      <h1 className="text-xl font-extrabold text-mu-fg">
        공유로 지출 추가
      </h1>
      <p className="text-sm text-mu-fg-2">
        로그인 후 가계부에 바로 넣을 수 있어요.
      </p>
      <Link
        href={`/login?next=${encodeURIComponent(loginNext)}`}
        className="inline-flex min-h-11 items-center text-sm font-bold text-mu-accent"
      >
        로그인하기
      </Link>
    </div>
  );
}
