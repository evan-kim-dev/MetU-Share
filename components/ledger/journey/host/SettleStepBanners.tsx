type TopProps = {
  loadError: boolean;
  loaded: boolean;
  openSettleSuggestionId: string | null;
  canCreateSettlement: boolean;
};

/** 요약 위: 로드 실패·정산 제안. */
export function SettleStepTopBanners({
  loadError,
  loaded,
  openSettleSuggestionId,
  canCreateSettlement,
}: TopProps) {
  return (
    <>
      {loadError ? (
        <p
          role="alert"
          className="rounded-mu-lg border border-mu-warn/30 bg-mu-warn-soft px-4 py-3 text-mu-caption font-semibold text-mu-warn"
        >
          정산 정보를 모두 불러오지 못했어요. 새로고침해 주세요.
        </p>
      ) : null}

      {loaded && openSettleSuggestionId && canCreateSettlement ? (
        <div
          role="status"
          className="rounded-mu-xl border border-mu-accent/25 bg-mu-accent-soft px-4 py-3"
        >
          <p className="text-mu-label font-bold text-mu-fg">정산 제안이 있어요</p>
          <p className="mt-1 text-mu-caption text-mu-fg-2">
            아래 버튼으로 확인하면 서버가 원장 기준으로 다시 계산한 뒤
            반영해요. 금액은 화면 미리보기와 다를 수 있어요.
          </p>
        </div>
      ) : null}
    </>
  );
}

type NotesProps = {
  stale: boolean;
  hasPaid: boolean;
  loaded: boolean;
  canCreateSettlement: boolean;
  isAnonymous: boolean;
  settlementExists: boolean;
  msg: string;
};

/** 대화 아래: stale·권한·빈 정산·메시지. */
export function SettleStepStatusNotes({
  stale,
  hasPaid,
  loaded,
  canCreateSettlement,
  isAnonymous,
  settlementExists,
  msg,
}: NotesProps) {
  return (
    <>
      {stale ? (
        <div
          role="status"
          className="rounded-mu-lg border border-mu-warn/30 bg-mu-warn-soft px-4 py-3 text-mu-caption font-semibold text-mu-warn"
        >
          <p>정산 후 지출이 바뀌었어요. 다시 계산할까요?</p>
          {hasPaid ? (
            <p className="mt-1 font-normal">
              이미 송금 표시된 항목이 있어요. 다시 계산하면 새 정산표가
              만들어져요.
            </p>
          ) : null}
        </div>
      ) : null}

      {!canCreateSettlement && loaded ? (
        <p className="text-mu-caption text-mu-fg-3">
          {isAnonymous
            ? "호스트가 정산을 계산해요. 송금은 송금 단계에서 표시할 수 있어요."
            : "정산표는 여행을 만든 분만 만들 수 있어요. 송금은 송금 단계에서 표시할 수 있어요."}
        </p>
      ) : null}

      {loaded && !settlementExists && canCreateSettlement ? (
        <p className="text-mu-caption text-mu-fg-3">
          아직 만든 정산표가 없어요. 아래 버튼으로 계산해 보세요.
        </p>
      ) : null}

      {msg ? <p className="text-mu-caption text-mu-fg-3">{msg}</p> : null}
    </>
  );
}

type FxProps = {
  fxFallbackCount: number;
};

/** CTA 아래: 환율 폴백 안내. */
export function SettleStepFxNotice({ fxFallbackCount }: FxProps) {
  if (fxFallbackCount <= 0) return null;
  return (
    <p
      role="alert"
      className="rounded-mu-md border border-mu-warn/30 bg-mu-warn-soft px-3 py-2 text-mu-caption font-semibold text-mu-warn"
    >
      {fxFallbackCount}건은 마지막으로 확인한 환율로 계산됐어요. 송금하기 전에
      금액을 한 번 더 확인해 주세요.
    </p>
  );
}
