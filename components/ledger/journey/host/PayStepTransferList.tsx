import { PAY_APPS } from "@/lib/ledger/pay-links";
import type { PayApp } from "@/lib/ledger/pay-links";
import { formatKRW } from "@/lib/shared/format";

import type { PayTransferRow } from "./pay-step-types";

type Props = {
  transfers: PayTransferRow[];
  nameOf: (id: string) => string;
  meId: string | undefined;
  isOwner: boolean;
  stale: boolean;
  onMarkPaid: (transferId: string) => void;
  onOpenPayApp: (app: PayApp, krw: number) => void;
};

export function PayStepTransferList({
  transfers,
  nameOf,
  meId,
  isOwner,
  stale,
  onMarkPaid,
  onOpenPayApp,
}: Props) {
  return (
    <ul className="flex flex-col gap-2">
      {transfers.map((t) => {
        const mineOut = Boolean(meId && t.from === meId);
        const canMark = isOwner || mineOut;
        return (
          <li
            key={t.id}
            className="flex flex-col gap-3 rounded-mu-xl border border-mu-line bg-mu-card p-4 text-mu-body"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-mu-body font-semibold text-mu-fg">
                  {nameOf(t.from)} → {nameOf(t.to)}
                </p>
                <p className="mu-num mt-1 text-mu-amount font-extrabold text-mu-fg">
                  {formatKRW(t.krw)}
                </p>
              </div>
              {t.status === "paid" ? (
                <span className="rounded-full bg-mu-ok-soft px-2.5 py-1 text-mu-caption font-bold text-mu-ok">
                  완료
                </span>
              ) : canMark ? (
                <button
                  type="button"
                  className="mu-focus min-h-tap shrink-0 rounded-mu-md px-2 text-mu-caption font-bold text-mu-accent"
                  onClick={() => onMarkPaid(t.id)}
                >
                  송금 완료
                </button>
              ) : null}
            </div>
            {t.status !== "paid" && mineOut && !stale ? (
              <div className="flex flex-wrap gap-2">
                {PAY_APPS.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    className="mu-focus min-h-tap rounded-mu-md border border-mu-accent bg-mu-accent-soft px-3 text-mu-caption font-bold text-mu-accent"
                    onClick={() => onOpenPayApp(app, t.krw)}
                  >
                    {app.label} 열기
                  </button>
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}