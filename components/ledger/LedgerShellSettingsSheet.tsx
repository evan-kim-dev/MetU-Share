import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CardProfileSettings } from "@/components/ledger/CardProfileSettings";
import { CashRateSettings } from "@/components/ledger/CashRateSettings";
import { HostPayoutSettings } from "@/components/ledger/HostPayoutSettings";
import { HostTransferSettings } from "@/components/ledger/HostTransferSettings";
import { Sheet } from "@/components/ds/Sheet";
import { INBOX_NAME } from "@/lib/ledger/inbox-copy";
import type { TripMember } from "@/lib/ledger/types";

import type { LedgerCardProfile } from "./ledger-shell-types";

type Props = {
  open: boolean;
  onClose: () => void;
  settingsRef: React.RefObject<HTMLDivElement | null>;
  tripId: string;
  userId: string | undefined;
  me: TripMember | undefined;
  members: TripMember[];
  profiles: LedgerCardProfile[];
  onProfilesChange: (profiles: LedgerCardProfile[]) => void;
  onTransferred: () => void;
};

export function LedgerShellSettingsSheet({
  open,
  onClose,
  settingsRef,
  tripId,
  userId,
  me,
  members,
  profiles,
  onProfilesChange,
  onTransferred,
}: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="설정">
      <div ref={settingsRef} className="flex flex-col gap-6 pb-2">
        {userId ? (
          <section className="flex flex-col gap-3" aria-label="정산 설정">
            <h3 className="text-mu-caption font-bold tracking-wide text-mu-fg-3">
              정산
            </h3>
            <HostPayoutSettings userId={userId} />
            {me?.isOwner ? (
              <HostTransferSettings
                tripId={tripId}
                meId={me.id}
                members={members}
                onTransferred={onTransferred}
              />
            ) : null}
          </section>
        ) : null}

        {userId || me ? (
          <section className="flex flex-col gap-3" aria-label="카드·환율">
            <h3 className="text-mu-caption font-bold tracking-wide text-mu-fg-3">
              카드 · 환율
            </h3>
            {userId ? (
              <CardProfileSettings
                userId={userId}
                profiles={profiles}
                onChange={onProfilesChange}
              />
            ) : null}
            {me ? <CashRateSettings tripId={tripId} memberId={me.id} /> : null}
          </section>
        ) : null}

        <section className="flex flex-col gap-2" aria-label="바로가기">
          <h3 className="text-mu-caption font-bold tracking-wide text-mu-fg-3">
            바로가기
          </h3>
          <ul className="overflow-hidden rounded-mu-lg border border-mu-line bg-mu-card">
            {(
              [
                {
                  href: `/trips/${tripId}/ledger/inbox`,
                  label: INBOX_NAME,
                },
                {
                  href: `/trips/${tripId}/ledger/report`,
                  label: "리포트",
                },
                {
                  href: `/trips/${tripId}/ledger/wallet`,
                  label: "면세 지갑",
                },
                {
                  href: `/trips/${tripId}/ledger/recap`,
                  label: "리캡",
                },
              ] as const
            ).map((item, index, list) => (
              <li
                key={item.href}
                className={
                  index < list.length - 1
                    ? "border-b border-mu-line"
                    : undefined
                }
              >
                <Link
                  href={item.href}
                  className="mu-focus flex min-h-11 items-center justify-between gap-3 px-3.5 text-sm font-semibold text-mu-fg"
                >
                  {item.label}
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-mu-fg-3"
                    strokeWidth={2}
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Sheet>
  );
}