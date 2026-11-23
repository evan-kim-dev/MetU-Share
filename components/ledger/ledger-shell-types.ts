import type { HostStepKey } from "@/lib/ledger/journey-state";

export type LedgerShellProps = {
  tripId: string;
  /** UX-S1: 여정 단계. 기본 record (기존 한 페이지와 동일 블록). */
  step?: HostStepKey;
  onNavigate?: (step: HostStepKey) => void;
};

/** 가계부 탭에서 넘어오는 ?add= / ?settings= 값. 알 수 없는 값은 무시한다. */
export type EntryIntent =
  | "manual"
  | "receipt"
  | "voice"
  | "cash"
  | "settings-fx";

export type LedgerCardProfile = {
  id: string;
  label: string;
  kind: string;
  fee_rate: number | null;
  fee_flat_krw: number;
};