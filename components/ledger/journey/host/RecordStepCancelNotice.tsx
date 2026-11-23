import { X } from "lucide-react";
import type { ExpenseDraftInput } from "@/lib/ledger/draft";

type Props = {
  cancelNotice: ExpenseDraftInput;
  onDismiss: () => void;
};

export function RecordStepCancelNotice({ cancelNotice, onDismiss }: Props) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-mu-lg border border-mu-line bg-mu-warn-soft px-4 py-3"
    >
      <div className="min-w-0 flex-1">
        <p className="text-mu-label text-mu-warn">취소 문자예요</p>
        <p className="mt-0.5 text-mu-body text-mu-fg">
          {cancelNotice.merchant ?? "가맹점"} ·{" "}
          <span className="mu-num">
            {cancelNotice.amount} {cancelNotice.currency}
          </span>
        </p>
        <p className="mt-0.5 text-mu-caption text-mu-fg-3">
          새 지출로 저장하지 않았어요.
        </p>
      </div>
      <button
        type="button"
        aria-label="취소 문자 안내 닫기"
        onClick={onDismiss}
        className="mu-focus flex h-11 w-11 shrink-0 items-center justify-center rounded-mu-md text-mu-fg-2"
      >
        <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}