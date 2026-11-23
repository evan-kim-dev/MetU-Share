"use client";

import {
  SplitChatRoom,
  toSplitChatMembers,
} from "@/components/ledger/SplitChatRoom";
import { SettleExplainSheet } from "@/components/ledger/SettleExplainSheet";

import type { SettleStepProps } from "./settle-step-types";
import {
  SettleStepFxNotice,
  SettleStepStatusNotes,
  SettleStepTopBanners,
} from "./SettleStepBanners";
import { SettleStepCta } from "./SettleStepCta";
import { SettleStepHeader } from "./SettleStepHeader";
import { SettleStepSummary } from "./SettleStepSummary";
import { useSettleStep } from "./useSettleStep";

type Props = SettleStepProps;

/**
 * 호스트 ⑤ 정산 단계. 잔액·통화합계·수수료 차이 → 정산표 생성.
 * 송금·공유·이력은 PayStep(U5).
 */
export function SettleStep({
  tripId,
  mode = "page",
  onAdjust,
  onPay,
  onOpenSettings,
  reference,
}: Props) {
  const s = useSettleStep({ tripId, onAdjust, onPay, reference });

  return (
    <div
      className={
        mode === "page"
          ? "mx-auto flex max-w-mobile flex-col gap-5 px-4 py-6 pb-8"
          : "flex flex-col gap-3 px-4 pt-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
      }
    >
      <SettleStepHeader
        mode={mode}
        tripId={tripId}
        onOpenSettings={onOpenSettings}
      />

      <SettleStepTopBanners
        loadError={s.loadError}
        loaded={s.loaded}
        openSettleSuggestionId={s.openSettleSuggestionId}
        canCreateSettlement={s.canCreateSettlement}
      />

      {s.loaded ? (
        <SettleStepSummary
          me={s.me}
          myShare={s.myShare}
          totalKrw={s.totalKrw}
          others={s.others}
          balances={s.balances}
          currencyTotals={s.currencyTotals}
          expenseRows={s.expenseRows}
          onExplain={() => s.setExplainOpen(true)}
        />
      ) : null}

      {s.loaded ? (
        <div ref={s.chatAnchorRef} className="-mx-4 flex min-h-[28rem] flex-col">
          <SplitChatRoom
            tripId={tripId}
            members={toSplitChatMembers(s.members)}
            variant="inline"
            onOpenAdvanced={s.openAdvanced}
          />
        </div>
      ) : null}

      <SettleStepStatusNotes
        stale={s.stale}
        hasPaid={s.hasPaid}
        loaded={s.loaded}
        canCreateSettlement={s.canCreateSettlement}
        isAnonymous={s.isAnonymous}
        settlementExists={Boolean(s.settlement)}
        msg={s.msg}
      />

      <SettleExplainSheet
        open={s.explainOpen}
        onClose={() => s.setExplainOpen(false)}
        result={s.explainResult}
        stale={s.stale}
        tripCurrencies={s.tripCurrencies}
        reference={s.reference}
      />

      <SettleStepCta
        canGoPay={s.canGoPay}
        canCreateSettlement={s.canCreateSettlement}
        creating={s.creating}
        openSettleSuggestionId={s.openSettleSuggestionId}
        settlementExists={Boolean(s.settlement)}
        stale={s.stale}
        onGoPay={s.goPay}
        onCreateSettlement={() => void s.createSettlement()}
      />

      <SettleStepFxNotice fxFallbackCount={s.fxFallbackCount} />
    </div>
  );
}
