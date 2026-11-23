import type { AddExpenseTab } from "@/components/ledger/journey/host/AddExpenseSheet";

import { QUICK_ACTIONS } from "./record-step-utils";

type Props = {
  onOpenAdd: (tab: AddExpenseTab) => void;
};

export function RecordStepQuickActions({ onOpenAdd }: Props) {
  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="group"
      aria-label="지출 추가 방법"
    >
      {QUICK_ACTIONS.map(({ tab, label, icon: Icon }) => (
        <button
          key={tab}
          type="button"
          onClick={() => onOpenAdd(tab)}
          className="mu-focus flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-mu-lg border border-mu-line bg-mu-card px-2 py-3 text-mu-caption font-bold text-mu-fg transition-colors active:bg-mu-sunken"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mu-accent-soft text-mu-accent">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          {label}
        </button>
      ))}
    </div>
  );
}