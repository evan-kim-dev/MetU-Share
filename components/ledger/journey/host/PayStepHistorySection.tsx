import { Sheet } from "@/components/ds/Sheet";
import { SettlementHistory } from "@/components/ledger/SettlementHistory";
import type { SettlementHistoryItem } from "@/lib/ledger/supabase";

type Props = {
  mode: "page" | "journey";
  audience: "host" | "guest";
  history: SettlementHistoryItem[];
  currentId: string | null;
  origin: string;
  historyOpen: boolean;
  onOpenHistory: () => void;
  onCloseHistory: () => void;
};

/** 이전 정산 시트(journey 호스트) 또는 인라인 이력(page). */
export function PayStepHistorySection({
  mode,
  audience,
  history,
  currentId,
  origin,
  historyOpen,
  onOpenHistory,
  onCloseHistory,
}: Props) {
  if (mode === "journey" && audience === "host") {
    return (
      <>
        <button
          type="button"
          className="min-h-tap self-start text-mu-caption font-bold text-mu-accent"
          onClick={onOpenHistory}
        >
          이전 정산 보기
        </button>
        <Sheet open={historyOpen} onClose={onCloseHistory} title="이전 정산">
          <SettlementHistory
            items={history}
            currentId={currentId}
            origin={origin}
          />
        </Sheet>
      </>
    );
  }

  if (mode === "page") {
    return (
      <SettlementHistory
        items={history}
        currentId={currentId}
        origin={origin}
      />
    );
  }

  return null;
}
