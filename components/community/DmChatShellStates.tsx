"use client";

import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function DmChatGuestState({ peerId }: { peerId: string }) {
  const router = useRouter();
  return (
    <MobileShell title="1:1 채팅" showBack backHref="/opod">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-center text-sm text-ink-body">
          1:1 채팅은 로그인 후 이용할 수 있어요.
        </p>
        <PrimaryButton
          className="h-11 min-h-tap rounded-xl bg-brand text-sm"
          onClick={() =>
            router.push(`/login?next=${encodeURIComponent(`/opod/dm/${peerId}`)}`)
          }
        >
          로그인하기
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}

export function DmChatBlockedState({ error }: { error: string }) {
  const router = useRouter();
  return (
    <MobileShell title="1:1 채팅" showBack backHref="/opod" showBottomNav={false}>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
        <p className="text-center text-sm text-ink-body">
          {error || "친구가 된 상대와만 1:1 채팅할 수 있어요."}
        </p>
        <PrimaryButton
          className="h-11 min-h-tap rounded-xl bg-brand text-sm"
          onClick={() => router.push("/opod")}
        >
          멧톡으로 돌아가기
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}