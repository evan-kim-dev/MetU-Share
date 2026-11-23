import Link from "next/link";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { EmptyState } from "@/components/ds/EmptyState";

type Props = {
  mode: "page" | "journey";
  audience: "host" | "guest";
  settleHref: string;
  onSettle?: () => void;
};

/** 정산표가 없을 때 빈 상태. */
export function PayStepEmpty({
  mode,
  audience,
  settleHref,
  onSettle,
}: Props) {
  return (
    <div className={mode === "page" ? "pb-8" : "pb-24"}>
      <EmptyState
        icon={Wallet}
        title="먼저 정산을 계산해요"
        body={
          audience === "guest"
            ? "호스트가 정산을 만들면 내가 보낼 금액이 여기에 보여요."
            : "호스트가 정산표를 만들면 여기서 송금할 수 있어요."
        }
        action={
          audience === "guest" ? undefined : onSettle ? (
            <Button onClick={onSettle}>정산하러 가기</Button>
          ) : (
            <Link
              href={settleHref}
              className="mu-focus text-mu-label text-mu-accent"
            >
              정산 화면 보기
            </Link>
          )
        }
      />
    </div>
  );
}
