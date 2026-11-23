import Link from "next/link";

type Props = {
  shareBlockedMessage: string;
  shareText: string | null;
  sharePath: string;
  shareUrl: string;
  canNativeShare: boolean;
  textCopyLabel: string | null;
  linkCopyLabel: string | null;
  onCopyShareText: () => void;
  onCopyShareLink: () => void;
  onNativeShare: () => void;
};

export function PayStepShareSection({
  shareBlockedMessage,
  shareText,
  sharePath,
  shareUrl,
  canNativeShare,
  textCopyLabel,
  linkCopyLabel,
  onCopyShareText,
  onCopyShareLink,
  onNativeShare,
}: Props) {
  return (
    <section
      aria-label="정산 공유"
      className="flex flex-col gap-3 rounded-mu-xl border border-mu-line bg-mu-card p-4 text-mu-caption"
    >
      <p className="text-mu-heading text-mu-fg">동행에게 공유하기</p>
      {shareBlockedMessage ? (
        <p className="font-semibold text-mu-warn">{shareBlockedMessage}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!shareText}
          className="mu-focus min-h-tap rounded-mu-md bg-mu-accent px-3 font-bold text-mu-on-accent disabled:opacity-40"
          onClick={onCopyShareText}
        >
          {textCopyLabel ?? "문구 복사"}
        </button>
        {canNativeShare ? (
          <button
            type="button"
            disabled={!shareText}
            className="mu-focus min-h-tap rounded-mu-md border border-mu-accent px-3 font-bold text-mu-accent disabled:opacity-40"
            onClick={onNativeShare}
          >
            공유하기
          </button>
        ) : null}
        {shareUrl ? (
          <button
            type="button"
            className="mu-focus min-h-tap rounded-mu-md border border-mu-accent px-3 font-bold text-mu-accent"
            onClick={onCopyShareLink}
          >
            {linkCopyLabel ?? "링크 복사"}
          </button>
        ) : null}
      </div>
      {sharePath ? (
        <Link className="break-all font-semibold text-mu-accent" href={sharePath}>
          {sharePath}
        </Link>
      ) : null}
    </section>
  );
}