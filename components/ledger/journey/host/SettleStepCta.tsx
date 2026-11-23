import { BottomCTA } from "@/components/ds/BottomCTA";

type Props = {
  canGoPay: boolean;
  canCreateSettlement: boolean;
  creating: boolean;
  openSettleSuggestionId: string | null;
  settlementExists: boolean;
  stale: boolean;
  onGoPay: () => void;
  onCreateSettlement: () => void;
};

/** 정산 계산 / 송금 이동 BottomCTA. */
export function SettleStepCta({
  canGoPay,
  canCreateSettlement,
  creating,
  openSettleSuggestionId,
  settlementExists,
  stale,
  onGoPay,
  onCreateSettlement,
}: Props) {
  if (canGoPay) {
    return (
      <BottomCTA
        label="송금하러 가기"
        onClick={onGoPay}
        loading={creating}
        secondary={
          canCreateSettlement
            ? {
                label: openSettleSuggestionId
                  ? "정산 제안 다시 반영하기"
                  : "정산 다시 계산하기",
                onClick: onCreateSettlement,
              }
            : undefined
        }
      />
    );
  }

  if (canCreateSettlement) {
    return (
      <BottomCTA
        label={
          openSettleSuggestionId
            ? "정산 제안 확인하기"
            : settlementExists
              ? "정산 다시 계산하기"
              : "정산 계산하기"
        }
        onClick={onCreateSettlement}
        loading={creating}
        hint={
          openSettleSuggestionId
            ? "에이전트 제안을 확인하면 서버가 다시 계산해요"
            : stale
              ? "지출이 바뀌었어요"
              : undefined
        }
      />
    );
  }

  return null;
}
