import Link from "next/link";

type Props = {
  loadError: boolean;
  stale: boolean;
  completed: boolean;
  autoOriginPending: boolean;
  settleHref: string;
  onSettle?: () => void;
};

export function PayStepStatusBanners({
  loadError,
  stale,
  completed,
  autoOriginPending,
  settleHref,
  onSettle,
}: Props) {
  return (
    <>
      {loadError ? (
        <p
          role="alert"
          className="rounded-mu-lg border border-mu-warn/30 bg-mu-warn-soft px-4 py-3 text-mu-caption font-semibold text-mu-warn"
        >
          정산 정보를 모두 불러오지 못했어요. 새로고침해 주세요.
        </p>
      ) : null}

      {stale ? (
        <div
          role="status"
          className="rounded-mu-lg border border-mu-warn/30 bg-mu-warn-soft px-4 py-3 text-mu-caption font-semibold text-mu-warn"
        >
          <p>송금표가 최신이 아니에요. 정산 단계에서 다시 계산해 주세요.</p>
          {onSettle ? (
            <button
              type="button"
              className="mt-2 min-h-tap text-mu-caption font-bold text-mu-accent"
              onClick={onSettle}
            >
              정산 단계로
            </button>
          ) : (
            <Link
              href={settleHref}
              className="mt-2 inline-flex min-h-tap items-center text-mu-caption font-bold text-mu-accent"
            >
              정산 단계로
            </Link>
          )}
        </div>
      ) : null}

      {autoOriginPending ? (
        <div className="rounded-mu-lg border border-mu-line bg-mu-sunken px-4 py-3 text-mu-caption font-semibold text-mu-fg-2">
          자동으로 만든 정산 제안이에요. 금액을 확인하고 직접 송금해 주세요.
        </div>
      ) : null}

      {completed ? (
        <p
          role="status"
          className="rounded-mu-lg border border-mu-ok/20 bg-mu-ok-soft px-4 py-3 text-mu-caption font-bold text-mu-ok"
        >
          정산 완료
        </p>
      ) : null}
    </>
  );
}