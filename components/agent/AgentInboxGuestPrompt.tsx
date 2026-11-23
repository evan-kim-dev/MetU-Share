import Link from "next/link";

export function AgentInboxGuestPrompt({
  tripId,
}: {
  tripId?: string | null;
}) {
  return (
    <section className="rounded-2xl border border-mu-line bg-mu-card p-5 text-center">
      <h2 className="text-base font-extrabold text-mu-fg">
        로그인하면 받은 알림을 볼 수 있어요
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-mu-fg-2">
        카드·은행 알림을 자동으로 모아 가계부에 넣어 드려요.
      </p>
      <Link
        href={`/login?next=${encodeURIComponent(
          tripId ? `/trips/${tripId}/ledger/inbox` : "/agent/inbox"
        )}`}
        className="bg-mu-accent mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl text-sm font-bold text-mu-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
      >
        로그인하기
      </Link>
    </section>
  );
}