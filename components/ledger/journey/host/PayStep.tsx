"use client";

import type { PayStepProps } from "./pay-step-types";
import { PayStepCta } from "./PayStepCta";
import { PayStepEmpty } from "./PayStepEmpty";
import { PayStepHeader } from "./PayStepHeader";
import { PayStepHistorySection } from "./PayStepHistorySection";
import { PayStepPayNote } from "./PayStepPayNote";
import { PayStepProgressCard } from "./PayStepProgressCard";
import { PayStepShareSection } from "./PayStepShareSection";
import { PayStepStatusBanners } from "./PayStepStatusBanners";
import { PayStepTransferList } from "./PayStepTransferList";
import { usePayStep } from "./usePayStep";

type Props = PayStepProps;

/**
 * 호스트 ⑥ 송금 단계. ProgressRing · 송금 목록(앱 열기·완료) · 공유 · 이전 정산(시트).
 * 금액 계산은 하지 않고, 저장된 정산표·RPC(mark_transfer_paid)만 써요.
 */
export function PayStep({
  tripId,
  mode = "journey",
  audience = "host",
  onSettle,
  onRecap,
  onDone,
  reference,
}: Props) {
  const p = usePayStep({ tripId, audience, reference });

  if (p.loaded && !p.settlement) {
    return (
      <PayStepEmpty
        mode={mode}
        audience={audience}
        settleHref={p.settleHref}
        onSettle={onSettle}
      />
    );
  }

  return (
    <div
      className={
        mode === "page"
          ? "flex flex-col gap-5 pb-8"
          : "flex flex-col gap-5 pb-24"
      }
    >
      {mode === "journey" ? <PayStepHeader audience={audience} /> : null}

      <PayStepStatusBanners
        loadError={p.loadError}
        stale={p.stale}
        completed={p.completed}
        autoOriginPending={
          Boolean(p.settlement?.origin === "auto" && !p.completed)
        }
        settleHref={p.settleHref}
        onSettle={onSettle}
      />

      {p.settlement && p.visibleTransfers.length > 0 ? (
        <PayStepProgressCard
          audience={audience}
          paidCount={p.paidCount}
          transferCount={p.transfers.length}
          myOutgoingPaid={p.myOutgoingPaid}
          myOutgoingTotal={p.myOutgoing.length}
        />
      ) : null}

      <PayStepTransferList
        transfers={p.visibleTransfers}
        nameOf={p.nameOf}
        meId={p.me?.id}
        isOwner={p.isOwner}
        stale={p.stale}
        onMarkPaid={(id) => void p.markPaid(id)}
        onOpenPayApp={p.openPayApp}
      />

      <PayStepPayNote
        payNote={p.payNote}
        amountCopyLabel={p.amountCopy.label}
      />

      {audience === "host" && p.settlement && p.transfers.length > 0 ? (
        <PayStepShareSection
          shareBlockedMessage={p.shareBlockedMessage}
          shareText={p.shareText}
          sharePath={p.sharePath}
          shareUrl={p.shareUrl}
          canNativeShare={p.canNativeShare}
          textCopyLabel={p.textCopy.label}
          linkCopyLabel={p.linkCopy.label}
          onCopyShareText={() => void p.copyShareText()}
          onCopyShareLink={() => void p.copyShareLink()}
          onNativeShare={() => void p.nativeShare()}
        />
      ) : null}

      <PayStepHistorySection
        mode={mode}
        audience={audience}
        history={p.history}
        currentId={p.settlement?.id ?? null}
        origin={p.origin}
        historyOpen={p.historyOpen}
        onOpenHistory={() => p.setHistoryOpen(true)}
        onCloseHistory={() => p.setHistoryOpen(false)}
      />

      {p.msg ? <p className="text-mu-caption text-mu-fg-3">{p.msg}</p> : null}

      {mode === "journey" && audience === "host" ? (
        <PayStepCta
          audience="host"
          completed={p.completed}
          shareText={p.shareText}
          shareBlockedMessage={p.shareBlockedMessage}
          recapHref={p.recapHref}
          onRecap={onRecap}
          onCopyShareText={() => void p.copyShareText()}
        />
      ) : null}

      {mode === "journey" && audience === "guest" ? (
        <PayStepCta
          audience="guest"
          myOutgoingDone={p.myOutgoingDone}
          myOutgoingLength={p.myOutgoing.length}
          myOutgoingUnpaidCount={p.myOutgoingUnpaid.length}
          onDone={onDone}
          onRemindUnpaid={() =>
            p.setMsg(
              "아직 보낼 송금이 있어요. 앱에서 보낸 뒤 각 항목의 ‘송금 완료’를 눌러 주세요."
            )
          }
        />
      ) : null}
    </div>
  );
}
