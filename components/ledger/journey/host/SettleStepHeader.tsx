import Link from "next/link";
import { Settings } from "lucide-react";

type Props = {
  mode: "page" | "journey";
  tripId: string;
  onOpenSettings?: () => void;
};

export function SettleStepHeader({ mode, tripId, onOpenSettings }: Props) {
  if (mode === "page") {
    return (
      <>
        <Link
          href={`/trips/${tripId}/ledger`}
          className="text-mu-caption font-bold text-mu-accent"
        >
          ← 정산 여정
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-mu-title text-mu-fg">정산</h1>
          <Link
            href={`/trips/${tripId}/ledger`}
            className="flex min-h-tap items-center text-mu-caption font-bold text-mu-accent"
          >
            가계부
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h2 className="text-mu-title text-mu-fg">이 금액으로 정산해요</h2>
        <p className="mt-1 text-mu-body text-mu-fg-2">
          내 몫을 확인하고 정산표를 만들어요.
        </p>
      </div>
      {onOpenSettings ? (
        <button
          type="button"
          aria-label="설정"
          className="mu-focus -mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-mu-md text-mu-fg-2"
          onClick={onOpenSettings}
        >
          <Settings className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}