import Link from "next/link";

export function ConnectFlowGuestPrompt() {
  return (
    <div className="rounded-2xl border border-mu-line bg-mu-bg p-5">
      <p className="text-sm leading-relaxed text-mu-fg">
        로그인하면 자동 기록을 연결할 수 있어요
      </p>
      <Link
        href="/login?next=/onboarding/automation"
        className="bg-mu-accent mt-4 inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl text-base font-bold text-mu-on-accent"
      >
        로그인하기
      </Link>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-11 w-full items-center justify-center text-sm text-mu-fg-2 underline"
      >
        홈으로
      </Link>
    </div>
  );
}