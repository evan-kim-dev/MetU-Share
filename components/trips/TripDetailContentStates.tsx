"use client";

import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function TripDetailLoadingState() {
  return (
    <MobileShell title="여행 상세" showBack backHref="/trips">
      <div
        className="flex flex-col gap-4 px-5 pt-5"
        aria-busy="true"
        aria-label="불러오는 중"
      >
        <div className="h-52 animate-pulse rounded-xl2 bg-surface-soft" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 animate-pulse rounded-2xl bg-surface-soft" />
          <div className="h-20 animate-pulse rounded-2xl bg-surface-soft" />
        </div>
        <div className="h-36 animate-pulse rounded-2xl bg-surface-soft" />
      </div>
    </MobileShell>
  );
}

export function TripDetailNotFoundState() {
  const router = useRouter();
  return (
    <MobileShell title="여행 상세" showBack backHref="/trips">
      <div className="flex flex-col items-center gap-3 px-5 py-20 text-center">
        <p className="text-base font-bold text-ink-heading">
          여행을 찾을 수 없어요
        </p>
        <PrimaryButton onClick={() => router.push("/trips")}>
          내 여행 목록으로
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}