"use client";

type Props = {
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
};

export function ExpenseConfirmFooter({ canSave, saving, onSave }: Props) {
  return (
    <button
      type="button"
      disabled={!canSave || saving}
      className="min-h-[52px] w-full rounded-xl bg-mu-accent py-3 text-sm font-extrabold text-mu-on-accent disabled:opacity-40"
      onClick={onSave}
    >
      {saving ? "저장 중…" : "저장"}
    </button>
  );
}
