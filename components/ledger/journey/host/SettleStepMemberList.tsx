import type { TripMember } from "@/lib/ledger/types";

import { balanceTone, signedKRW } from "./settle-step-utils";

type Props = {
  others: TripMember[];
  balances: Record<string, number>;
};

/** 나 제외 멤버 잔액 목록. */
export function SettleStepMemberList({ others, balances }: Props) {
  if (others.length === 0) return null;
  return (
    <ul
      aria-label="다른 멤버"
      className="border-t border-mu-line divide-y divide-mu-line"
    >
      {others.map((m) => {
        const value = balances[m.id] ?? 0;
        return (
          <li
            key={m.id}
            data-testid={`balance-${m.id}`}
            className="flex min-h-tap items-center justify-between gap-3 px-6 py-2.5"
          >
            <span className="text-mu-body text-mu-fg-2">{m.displayName}</span>
            <span
              className={`mu-num text-mu-body font-semibold ${balanceTone(value)}`}
            >
              {signedKRW(value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
