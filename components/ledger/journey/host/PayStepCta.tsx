import { BottomCTA } from "@/components/ds/BottomCTA";

type HostProps = {
  audience: "host";
  completed: boolean;
  shareText: string | null;
  shareBlockedMessage: string;
  recapHref: string;
  onRecap?: () => void;
  onCopyShareText: () => void;
};

type GuestProps = {
  audience: "guest";
  myOutgoingDone: boolean;
  myOutgoingLength: number;
  myOutgoingUnpaidCount: number;
  onDone?: () => void;
  onRemindUnpaid: () => void;
};

type Props = HostProps | GuestProps;

/** journey 모드 호스트/게스트 BottomCTA. */
export function PayStepCta(props: Props) {
  if (props.audience === "host") {
    const {
      completed,
      shareText,
      shareBlockedMessage,
      recapHref,
      onRecap,
      onCopyShareText,
    } = props;
    return (
      <BottomCTA
        label={completed ? "리캡 보기" : "정산 현황 공유하기"}
        onClick={() => {
          if (completed) {
            if (onRecap) onRecap();
            else window.location.href = recapHref;
            return;
          }
          onCopyShareText();
        }}
        disabled={!completed && !shareText}
        hint={
          completed
            ? undefined
            : shareText
              ? "문구를 복사해 동행에게 보내요"
              : shareBlockedMessage || undefined
        }
      />
    );
  }

  const {
    myOutgoingDone,
    myOutgoingLength,
    myOutgoingUnpaidCount,
    onDone,
    onRemindUnpaid,
  } = props;

  return (
    <BottomCTA
      label={
        myOutgoingDone || myOutgoingLength === 0
          ? "완료 확인"
          : "송금 완료했어요"
      }
      onClick={() => {
        if (myOutgoingDone || myOutgoingLength === 0) {
          onDone?.();
          return;
        }
        onRemindUnpaid();
      }}
      hint={
        myOutgoingUnpaidCount > 0
          ? `남은 송금 ${myOutgoingUnpaidCount}건`
          : myOutgoingLength === 0
            ? "내가 보낼 금액은 없어요"
            : undefined
      }
    />
  );
}
