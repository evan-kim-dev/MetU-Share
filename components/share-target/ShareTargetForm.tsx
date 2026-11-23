"use client";

import Link from "next/link";
import { Share2 } from "lucide-react";
import { ExpenseConfirmSheet } from "@/components/ledger/ExpenseConfirmSheet";
import { PasteExpenseBox } from "@/components/ledger/PasteExpenseBox";
import { ReceiptUploader } from "@/components/ledger/ReceiptUploader";
import type { ExpenseDraftInput } from "@/lib/ledger/draft";
import { isIosDevice } from "@/lib/ledger/share-inbox";
import type { TripMember } from "@/lib/ledger/types";
import type { Trip } from "@/lib/trips/types";
import type { PendingShare } from "@/components/share-target/share-target.utils";

type CardProfileOption = {
  id: string;
  label: string;
  fee_rate: number | null;
  fee_flat_krw: number;
};

export function ShareTargetForm({
  shareCapable,
  loadError,
  processError,
  processing,
  tripId,
  setTripId,
  activeTrips,
  pending,
  members,
  queue,
  queueIndex,
  setQueueIndex,
  setQueue,
  profiles,
  openDrafts,
  onSaved,
}: {
  shareCapable: boolean;
  loadError: string;
  processError: string;
  processing: boolean;
  tripId: string;
  setTripId: (id: string) => void;
  activeTrips: Trip[];
  pending: PendingShare | null;
  members: TripMember[];
  queue: ExpenseDraftInput[];
  queueIndex: number;
  setQueueIndex: (i: number) => void;
  setQueue: (drafts: ExpenseDraftInput[]) => void;
  profiles: CardProfileOption[];
  openDrafts: (drafts: ExpenseDraftInput[]) => void;
  onSaved: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mu-accent-soft text-mu-accent">
          <Share2 className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-extrabold text-mu-fg">
            공유로 지출 추가
          </h1>
          <p className="mt-1 text-xs leading-5 text-mu-fg-2">
            {shareCapable
              ? "다른 앱에서 MetU로 영수증·문자를 공유하면 가계부 초안이 만들어져요."
              : "홈 화면에 설치한 Android 앱에서만 시스템 공유를 받을 수 있어요."}
          </p>
          {isIosDevice() ? (
            <p className="mt-2 rounded-lg bg-mu-sunken px-2 py-1.5 text-mu-caption font-semibold text-mu-fg-2">
              iOS Safari / 홈 화면 앱은 Web Share Target을 지원하지 않아요. 아래
              붙여넣기·사진 업로드를 이용해 주세요.
            </p>
          ) : null}
        </div>
      </div>

      {loadError ? (
        <p className="rounded-lg bg-mu-err-soft px-3 py-2 text-xs font-semibold text-mu-err">
          {loadError}
        </p>
      ) : null}
      {processError ? (
        <p className="rounded-lg bg-mu-err-soft px-3 py-2 text-xs font-semibold text-mu-err">
          {processError}
        </p>
      ) : null}
      {processing ? (
        <p className="text-xs font-semibold text-mu-fg-3">
          공유 내용 분석 중…
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-bold text-mu-fg">여행 선택</span>
        <select
          className="min-h-11 rounded-lg border border-mu-line px-3 py-2 text-sm"
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
        >
          <option value="">여행 없이 미할당으로 받기</option>
          {activeTrips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.destination} · {t.dateRange}
            </option>
          ))}
        </select>
        {activeTrips.length === 0 ? (
          <p className="text-xs text-mu-fg-3">
            여행은 나중에 만들어도 돼요. 텍스트는{" "}
            <Link href="/agent/inbox" className="font-bold text-mu-accent">
              확인함
            </Link>
            에 미할당으로 들어가요.{" "}
            <Link href="/onboarding" className="font-bold text-mu-accent">
              여행 만들기
            </Link>
          </p>
        ) : null}
      </label>

      {pending?.file && !tripId ? (
        <p
          role="status"
          className="rounded-lg bg-mu-sunken px-3 py-2 text-xs font-semibold leading-5 text-mu-fg-2"
        >
          영수증 사진은 여행을 선택해야 가계부에 넣을 수 있어요. 위에서 여행을
          고르거나{" "}
          <Link href="/onboarding" className="font-bold text-mu-accent">
            새 여행을 만들어 주세요
          </Link>
          .
        </p>
      ) : null}

      {(!shareCapable || !pending) && tripId && members.length > 0 ? (
        <>
          <PasteExpenseBox tripId={tripId} onDrafts={openDrafts} />
          <ReceiptUploader tripId={tripId} onDraft={(d) => openDrafts([d])} />
        </>
      ) : null}

      {queue.length > 0 && tripId && members.length > 0 ? (
        <ExpenseConfirmSheet
          tripId={tripId}
          members={members}
          drafts={queue}
          index={queueIndex}
          onIndexChange={setQueueIndex}
          onClose={() => setQueue([])}
          onSaved={onSaved}
          cardProfiles={profiles}
        />
      ) : null}
    </div>
  );
}
