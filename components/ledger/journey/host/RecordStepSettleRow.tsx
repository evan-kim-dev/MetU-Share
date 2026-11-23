import { ChevronRight, Scale } from "lucide-react";
import type { OpenBudgetSuggestion } from "@/lib/ledger/open-suggestions";

type Props = {
  openSuggestions: OpenBudgetSuggestion[];
  onSettle: () => void;
};

export function RecordStepSettleRow({ openSuggestions, onSettle }: Props) {
  const hasSettleSuggestion = openSuggestions.some((s) => s.type === "settle");

  return (
    <button
      type="button"
      onClick={onSettle}
      aria-label="정산으로 이동"
      className="mu-focus flex min-h-tap w-full items-center gap-3 rounded-mu-xl border border-mu-line bg-mu-card px-4 py-3 text-left"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mu-sunken text-mu-fg-2">
        <Scale className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="block text-mu-body font-semibold text-mu-fg">
            정산
          </span>
          {hasSettleSuggestion ? (
            <span className="rounded-mu-sm bg-mu-accent-soft px-1.5 py-0.5 text-mu-caption font-bold text-mu-accent">
              제안 있음
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-mu-caption text-mu-fg-3">
          {hasSettleSuggestion
            ? "에이전트 정산 제안을 확인해 주세요"
            : "누가 얼마를 받을지 정리해요"}
        </span>
      </span>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-mu-fg-3"
        strokeWidth={1.75}
        aria-hidden
      />
    </button>
  );
}