"use client";

import type { ExpenseDraftInput } from "@/lib/ledger/draft";

type Props = {
  draft: ExpenseDraftInput;
  feeUnset: boolean;
  paymentMethod: "card" | "cash" | "transfer";
};

export function ExpenseConfirmWarnings({
  draft,
  feeUnset,
  paymentMethod,
}: Props) {
  const showBlock =
    (draft.warnings?.length ?? 0) > 0 ||
    (feeUnset && paymentMethod === "card") ||
    draft.timeIsEstimated;

  if (!showBlock) return null;

  return (
    <ul className="mb-3 flex flex-col gap-1">
      {draft.timeIsEstimated ? (
        <li className="rounded-md bg-mu-warn-soft px-2 py-1 text-xs font-semibold text-mu-warn">
          시간 추정
        </li>
      ) : null}
      {feeUnset && paymentMethod === "card" ? (
        <li className="rounded-md bg-mu-warn-soft px-2 py-1 text-xs font-semibold text-mu-warn">
          수수료 미설정
        </li>
      ) : null}
      {(draft.warnings ?? []).map((w) => (
        <li
          key={w}
          className="rounded-md bg-mu-sunken px-2 py-1 text-[11px] font-semibold text-mu-fg-2"
        >
          {w}
        </li>
      ))}
    </ul>
  );
}