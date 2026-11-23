"use client";

import { Check, Share2 } from "lucide-react";

export function TripDetailShareButton({
  shareCopied,
  onShare,
}: {
  shareCopied: boolean;
  onShare: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={shareCopied ? "링크 복사됨" : "여행 공유"}
      onClick={onShare}
      className="flex h-9 w-9 items-center justify-center rounded-full text-ink-heading transition-colors active:bg-surface-soft"
    >
      {shareCopied ? (
        <Check className="h-5 w-5 text-brand" strokeWidth={2.2} />
      ) : (
        <Share2 className="h-5 w-5" strokeWidth={2} />
      )}
    </button>
  );
}