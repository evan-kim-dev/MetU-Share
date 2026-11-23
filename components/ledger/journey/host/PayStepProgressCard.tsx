import { ProgressRing } from "@/components/ds/ProgressRing";

type Props = {
  audience: "host" | "guest";
  paidCount: number;
  transferCount: number;
  myOutgoingPaid: number;
  myOutgoingTotal: number;
};

export function PayStepProgressCard({
  audience,
  paidCount,
  transferCount,
  myOutgoingPaid,
  myOutgoingTotal,
}: Props) {
  const value =
    audience === "guest" ? myOutgoingPaid : paidCount;
  const max =
    audience === "guest"
      ? Math.max(myOutgoingTotal, 1)
      : transferCount;
  const ringLabel =
    audience === "guest"
      ? `내 송금 ${myOutgoingPaid}/${myOutgoingTotal || 0} 완료`
      : `${paidCount}/${transferCount} 송금 완료`;
  const headingLabel =
    audience === "guest"
      ? `내 송금 ${myOutgoingPaid}/${myOutgoingTotal || 0} 완료`
      : `${paidCount}/${transferCount} 완료`;

  return (
    <div className="flex items-center gap-4 rounded-mu-xl border border-mu-line bg-mu-card p-4">
      <ProgressRing
        value={value}
        max={max}
        size={72}
        label={ringLabel}
      />
      <div className="min-w-0">
        <p className="text-mu-caption text-mu-fg-3">진행</p>
        <p className="mt-0.5 text-mu-heading text-mu-fg">{headingLabel}</p>
      </div>
    </div>
  );
}