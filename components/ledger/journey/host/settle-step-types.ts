import type { SettleReference } from "@/components/ledger/useSettleReference";

export type SettleStepProps = {
  tripId: string;
  /** page = `/ledger/settle` 단독. journey = TripJourney 정산 칸. */
  mode?: "page" | "journey";
  /** journey 모드에서 분담 단계로 이동 */
  onAdjust?: () => void;
  /** journey 모드에서 송금 단계로 이동 */
  onPay?: () => void;
  /** journey 모드 제목 옆 설정(톱니) */
  onOpenSettings?: () => void;
  /** settle URL 에서 PayStep 과 공유할 참고 환율 상태 */
  reference?: SettleReference;
};