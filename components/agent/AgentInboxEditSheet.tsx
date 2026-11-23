import { Sheet } from "@/components/ds/Sheet";
import type { AgentEventRow } from "@/components/agent/agent-inbox-types";
import { canEditDraft } from "@/components/agent/agent-inbox-helpers";

export function AgentInboxEditSheet({
  editEvent,
  editText,
  editMerchant,
  editAmount,
  editCurrency,
  editSpentOn,
  busyId,
  onClose,
  onSave,
  onEditText,
  onEditMerchant,
  onEditAmount,
  onEditCurrency,
  onEditSpentOn,
}: {
  editEvent: AgentEventRow | null;
  editText: string;
  editMerchant: string;
  editAmount: string;
  editCurrency: string;
  editSpentOn: string;
  busyId: string | null;
  onClose: () => void;
  onSave: () => void;
  onEditText: (value: string) => void;
  onEditMerchant: (value: string) => void;
  onEditAmount: (value: string) => void;
  onEditCurrency: (value: string) => void;
  onEditSpentOn: (value: string) => void;
}) {
  return (
    <Sheet open={Boolean(editEvent)} onClose={onClose} title="알림 수정">
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-bold text-mu-fg">알림 내용</span>
          <textarea
            value={editText}
            onChange={(e) => onEditText(e.target.value)}
            rows={4}
            maxLength={2000}
            className="min-h-[88px] w-full rounded-xl border border-mu-line px-3 py-2 text-sm"
          />
        </label>
        {editEvent && canEditDraft(editEvent.status) ? (
          <>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-bold text-mu-fg">상호</span>
              <input
                value={editMerchant}
                onChange={(e) => onEditMerchant(e.target.value)}
                className="min-h-11 rounded-xl border border-mu-line px-3 text-sm"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-mu-fg">금액</span>
                <input
                  value={editAmount}
                  inputMode="decimal"
                  onChange={(e) => onEditAmount(e.target.value)}
                  className="min-h-11 rounded-xl border border-mu-line px-3 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-mu-fg">통화</span>
                <input
                  value={editCurrency}
                  maxLength={3}
                  onChange={(e) => onEditCurrency(e.target.value.toUpperCase())}
                  className="min-h-11 rounded-xl border border-mu-line px-3 text-sm"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-bold text-mu-fg">날짜 (선택)</span>
              <input
                type="date"
                value={editSpentOn}
                onChange={(e) => onEditSpentOn(e.target.value)}
                className="min-h-11 rounded-xl border border-mu-line px-3 text-sm"
              />
            </label>
          </>
        ) : null}
        <p className="text-[11px] text-mu-fg-3">
          {editEvent && canEditDraft(editEvent.status)
            ? "확인용 초안이에요. 저장 후 「가계부에 추가」로 반영해요. 이미 들어간 지출은 안 바뀌어요."
            : "표시 문구만 바꿔요. 이미 가계부에 들어간 지출은 안 바뀌어요."}
        </p>
        <button
          type="button"
          disabled={busyId === editEvent?.id}
          className="min-h-11 rounded-xl bg-mu-accent px-4 text-sm font-bold text-mu-on-accent disabled:opacity-50"
          onClick={onSave}
        >
          저장
        </button>
      </div>
    </Sheet>
  );
}