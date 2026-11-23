"use client";

import type { DuplicateCandidate } from "@/lib/ledger/dedupe";

type Props = {
  dupes: DuplicateCandidate[];
  onClose: () => void;
  onIgnore: () => void;
};

export function ExpenseConfirmDuplicateBanner({
  dupes,
  onClose,
  onIgnore,
}: Props) {
  return (
    <div className="mb-3 rounded-xl border border-mu-warn bg-mu-warn-soft px-3 py-2 text-xs">
      <p className="font-bold text-mu-warn">같은 결제 같아요</p>
      <p className="mt-1 text-mu-warn">
        후보 {dupes.length}건 · 점수 {dupes[0]!.score}
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="font-bold text-mu-warn underline"
          onClick={onClose}
        >
          합치기(저장 취소)
        </button>
        <button
          type="button"
          className="font-bold text-mu-warn underline"
          onClick={onIgnore}
        >
          다른 결제예요
        </button>
      </div>
    </div>
  );
}