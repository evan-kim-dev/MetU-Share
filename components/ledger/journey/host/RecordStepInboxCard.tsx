import Link from "next/link";
import { Sparkles } from "lucide-react";

type Props = {
  tripId: string;
  inboxCount: number;
};

export function RecordStepInboxCard({ tripId, inboxCount }: Props) {
  if (inboxCount <= 0) return null;

  return (
    <section className="overflow-hidden rounded-mu-xl border border-mu-line bg-mu-card">
      <div className="flex items-start gap-3 px-4 pt-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mu-accent-soft text-mu-accent">
          <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-mu-label font-bold text-mu-fg">확인할 지출</p>
          <p className="mt-0.5 text-mu-body text-mu-fg-2">
            영수증·문자 제안이{" "}
            <span className="mu-num font-semibold">{inboxCount}건</span>{" "}
            있어요. 확인 후에만 장부에 들어가요.
          </p>
        </div>
      </div>
      <div className="mt-3 border-t border-mu-line px-4 py-3">
        <Link
          href={`/trips/${tripId}/ledger/inbox`}
          className="mu-focus flex min-h-tap w-full items-center justify-center rounded-mu-md bg-mu-accent text-mu-label font-semibold text-mu-on-accent"
        >
          확인함 열기
          {inboxCount > 1 ? (
            <span className="mu-num ml-1.5 opacity-90">· {inboxCount}건</span>
          ) : null}
        </Link>
      </div>
    </section>
  );
}