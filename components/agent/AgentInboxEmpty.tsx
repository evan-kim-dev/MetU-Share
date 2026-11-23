import Link from "next/link";

export function AgentInboxEmpty({
  connectHref,
  connected,
}: {
  connectHref: string;
  connected: boolean;
}) {
  return (
    <div className="rounded-2xl bg-mu-sunken p-6 text-center text-sm leading-relaxed text-mu-fg-2">
      <p className="font-extrabold text-mu-fg">아직 받은 알림이 없어요</p>
      <p className="mt-2">
        {connected
          ? "연결은 됐어요. 알림이 오면 여기에 나타나요."
          : "카드 알림 자동 기록을 연결하면 결제 알림이 여기에 모여요."}
      </p>
      <Link
        href={connectHref}
        className="bg-mu-accent mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl px-5 text-sm font-bold text-mu-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
      >
        {connected ? "연결 상태 확인" : "자동 기록 연결하기"}
      </Link>
      {!connected ? (
        <Link
          href="/onboarding/shortcut-guide"
          className="mt-3 block text-sm font-semibold text-mu-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
        >
          연동 가이드 보기
        </Link>
      ) : null}
    </div>
  );
}