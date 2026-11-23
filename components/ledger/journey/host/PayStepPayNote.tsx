import { PAY_DEEPLINK_NOTICE } from "@/lib/ledger/pay-links";

type Props = {
  payNote: string;
  amountCopyLabel: string | null;
};

/** 송금 앱 열기·금액 복사 안내. */
export function PayStepPayNote({ payNote, amountCopyLabel }: Props) {
  if (!payNote) return null;
  return (
    <div
      role="status"
      className="rounded-mu-lg border border-mu-line bg-mu-sunken px-4 py-3 text-mu-caption text-mu-fg-2"
    >
      <p>{payNote}</p>
      <p className="mt-1 font-semibold">{PAY_DEEPLINK_NOTICE}</p>
      {amountCopyLabel ? (
        <p className="mt-1 text-mu-fg-3">{amountCopyLabel}</p>
      ) : null}
    </div>
  );
}
