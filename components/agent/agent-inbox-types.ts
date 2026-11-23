import type {
  SmsParsePreviewLabel,
  UnassignedSuggestInfo,
} from "@/lib/agent/event-status";

export type ResultItem = {
  ref?: number;
  decision?: string;
  expenseId?: string;
  reasons?: string[];
  /** 정책 사유 코드 (lib/agent/policy.ts). 알면 event-status 의 사유 표를 쓴다. */
  reasonCode?: string;
  /** 같은 결제로 보이는 기존 지출 (영수증 합치기 후보) */
  mergeInto?: string;
  /** receipt_attach | billed_krw */
  mergeKind?: string;
  draft?: {
    merchant?: string | null;
    amount?: number | null;
    currency?: string | null;
    spentOn?: string | null;
  };
  priced?: { krwAmount?: number; amount?: number; currency?: string };
};

export type AgentEventRow = {
  id: string;
  trip_id: string | null;
  source: string;
  kind: string;
  status: string;
  payload: { text?: string; received_at?: string; receivedAt?: string } | null;
  result: {
    items?: ResultItem[];
    reason?: string;
    /** 서버가 ingest/재매칭 때 계산한 "이 여행에 붙일까요?" 제안 */
    suggest?: UnassignedSuggestInfo & { tripId: string };
    /** 서버가 만든 한국어 사유 (reason 은 내부 코드) */
    message?: string;
    preview?: SmsParsePreviewLabel & { confidence?: number; kind?: string };
  } | null;
  error: string | null;
  created_at: string;
  processed_at: string | null;
};

export type TripOption = { id: string; label: string };

export type Suggestion = UnassignedSuggestInfo & { tripId: string };

export type AgentInboxProps = {
  /** When omitted, shows all of the user's events (user-scoped inbox). */
  tripId?: string | null;
  trips?: TripOption[];
  /**
   * true면 MobileShell·바깥 패딩 없이 본문만.
   * 여행 확인함(`LedgerInboxClient`)이 쉘을 소유할 때 사용.
   */
  embedded?: boolean;
};

export type BulkAttachState = {
  tripId: string;
  done: number;
  total: number;
  failed: number;
  running: boolean;
};