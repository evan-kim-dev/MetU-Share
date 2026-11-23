"use client";

import Link from "next/link";
import { ChartColumn, ChevronRight, FileText } from "lucide-react";
import { BottomCTA } from "@/components/ds/BottomCTA";
import { CashPocketCard } from "@/components/ledger/CashPocketCard";
import { OpenBudgetSuggestionCard } from "@/components/ledger/OpenBudgetSuggestionCard";
import { deriveTodayBudget } from "@/lib/ledger/today-budget";
import { todayIsoDate } from "@/lib/shared/dates";

import type { RecordStepProps } from "./record-step-types";
import { RecordStepCancelNotice } from "./RecordStepCancelNotice";
import { RecordStepInboxCard } from "./RecordStepInboxCard";
import { RecordStepQuickActions } from "./RecordStepQuickActions";
import { RecordStepSettleRow } from "./RecordStepSettleRow";
import { RecordStepTodayBudget } from "./RecordStepTodayBudget";
import { RecordStepTodayList } from "./RecordStepTodayList";
import { sortRecent } from "./record-step-utils";

type Props = RecordStepProps;

/** 호스트 ③ 기록 단계: Today 히어로 · 에이전트 1건 · 오늘 지출. */
export function RecordStep({
  tripId,
  expenses,
  members,
  inboxCount,
  openSuggestions = [],
  onSuggestionSettled,
  cancelNotice,
  onDismissCancel,
  onOpenAdd,
  onOpenIntent,
  onAdjust,
  onSettle,
  dashboard,
  planAllocation = [],
  tripBudgetKrw = 0,
  tripDays = 1,
}: Props) {
  const today = todayIsoDate();
  const todayView = deriveTodayBudget({
    totalBudgetKrw: tripBudgetKrw,
    tripDays,
    expenses,
    todayIso: today,
  });
  const todayExpenses = sortRecent(
    expenses.filter((e) => e.spentOn === today)
  );

  return (
    <div className="flex flex-col gap-5 pb-24">
      <RecordStepTodayBudget
        todayView={todayView}
        tripBudgetKrw={tripBudgetKrw}
      />

      {openSuggestions.map((s) => (
        <OpenBudgetSuggestionCard
          key={s.id}
          tripId={tripId}
          suggestion={s}
          onSettled={() => onSuggestionSettled?.()}
          onGoSettle={s.type === "settle" ? onSettle : undefined}
        />
      ))}

      <RecordStepInboxCard tripId={tripId} inboxCount={inboxCount} />

      <CashPocketCard expenses={expenses} />

      <RecordStepQuickActions onOpenAdd={onOpenAdd} />

      <RecordStepSettleRow
        openSuggestions={openSuggestions}
        onSettle={onSettle}
      />

      {cancelNotice ? (
        <RecordStepCancelNotice
          cancelNotice={cancelNotice}
          onDismiss={onDismissCancel}
        />
      ) : null}

      <RecordStepTodayList
        todayExpenses={todayExpenses}
        members={members}
        planAllocation={planAllocation}
        onAdjust={onAdjust}
        onOpenAdd={onOpenAdd}
      />

      {expenses.length > 0 ? (
        <details className="group overflow-hidden rounded-mu-xl border border-mu-line bg-mu-card">
          <summary className="mu-focus flex min-h-tap cursor-pointer list-none items-center gap-2 px-4 py-3 text-mu-label text-mu-fg">
            <ChartColumn
              className="h-5 w-5 text-mu-accent"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="flex-1 font-bold">지출 분석 보기</span>
            <ChevronRight
              className="h-5 w-5 text-mu-fg-3 transition-transform group-open:rotate-90"
              strokeWidth={1.75}
              aria-hidden
            />
          </summary>
          <div className="border-t border-mu-line px-4 py-4">{dashboard}</div>
        </details>
      ) : null}

      <Link
        href={`/trips/${tripId}/ledger/report`}
        className="mu-focus flex min-h-tap items-center gap-3 rounded-mu-xl border border-mu-line bg-mu-card px-4 py-3"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mu-sunken text-mu-fg-2">
          <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-mu-body font-semibold text-mu-fg">
            리포트
          </span>
          <span className="mt-0.5 block text-mu-caption text-mu-fg-3">
            여행 지출을 한눈에 정리해요
          </span>
        </span>
        <ChevronRight
          className="h-5 w-5 shrink-0 text-mu-fg-3"
          strokeWidth={1.75}
          aria-hidden
        />
      </Link>

      <BottomCTA
        label="추가"
        onClick={onOpenIntent}
        secondary={{ label: "다음: 정산하기", onClick: onSettle }}
      />
    </div>
  );
}