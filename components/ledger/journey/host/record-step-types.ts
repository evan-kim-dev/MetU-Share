import type { AddExpenseTab } from "@/components/ledger/journey/host/AddExpenseSheet";
import type { ExpenseDraftInput } from "@/lib/ledger/draft";
import type { OpenBudgetSuggestion } from "@/lib/ledger/open-suggestions";
import type { PlanAlloc } from "@/lib/ledger/plan-match";
import type { LedgerExpenseRow, TripMember } from "@/lib/ledger/types";

export type RecordStepProps = {
  tripId: string;
  expenses: LedgerExpenseRow[];
  members: TripMember[];
  /** 확인할 자동 수집 알림 + 대기 중인 게스트 제안 */
  inboxCount: number;
  /** open rebalance·settle Suggestion (Today 카드) */
  openSuggestions?: OpenBudgetSuggestion[];
  onSuggestionSettled?: () => void;
  cancelNotice: ExpenseDraftInput | null;
  onDismissCancel: () => void;
  onOpenAdd: (tab: AddExpenseTab) => void;
  /** 주 CTA: 의도 선택 시트 (일정·분담·현금·봇 포함) */
  onOpenIntent: () => void;
  /** 지출을 누르면 분담(선택) 단계로 가요. */
  onAdjust: () => void;
  /** 주 흐름: 기록 → 정산. */
  onSettle: () => void;
  /** 통계 카드 (LedgerDashboard) */
  dashboard: React.ReactNode;
  /** 플랜 예산 배분 — 항공·숙소 매칭 안내 (예상≠실제) */
  planAllocation?: ReadonlyArray<PlanAlloc>;
  /** 총 예산(표시용 일 한도 계산) */
  tripBudgetKrw?: number;
  /** 여행 일수(없으면 1) */
  tripDays?: number;
};

export type PlanHint = {
  status: "review";
  statusLabel: string;
} | null;