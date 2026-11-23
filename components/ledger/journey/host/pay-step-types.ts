import type { SettleReference } from "@/components/ledger/useSettleReference";

export type PayStepProps = {
  tripId: string;
  /** page = settle URL 아래 조합. journey = TripJourney 송금 칸. */
  mode?: "page" | "journey";
  /** 호스트 CTA(공유/리캡) vs 게스트 CTA(내 송금·완료) */
  audience?: "host" | "guest";
  /** 정산표가 없을 때 정산 단계로 */
  onSettle?: () => void;
  /** 호스트: 모두 송금 완료 시 리캡. 게스트: 내 송금 끝나면 완료 단계 */
  onRecap?: () => void;
  onDone?: () => void;
  /** settle URL 에서 SettleStep 과 공유할 참고 환율 상태 */
  reference?: SettleReference;
};

export type PayTransferRow = {
  id: string;
  from: string;
  to: string;
  krw: number;
  status: "pending" | "paid";
};