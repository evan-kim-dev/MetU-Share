"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CashWithdrawSheet } from "@/components/ledger/CashWithdrawSheet";
import { ExpenseConfirmSheet } from "@/components/ledger/ExpenseConfirmSheet";
import { GuestExpenseSlot } from "@/components/ledger/GuestExpenseSlot";
import { LedgerDashboard } from "@/components/ledger/LedgerDashboard";
import { LedgerShellGuestRecord } from "@/components/ledger/LedgerShellGuestRecord";
import { LedgerShellSettingsSheet } from "@/components/ledger/LedgerShellSettingsSheet";
import { AdjustStep } from "@/components/ledger/journey/host/AdjustStep";
import { ConnectStep } from "@/components/ledger/journey/host/ConnectStep";
import { InviteStep } from "@/components/ledger/journey/host/InviteStep";
import { RecordStep } from "@/components/ledger/journey/host/RecordStep";
import { PayStep } from "@/components/ledger/journey/host/PayStep";
import { SettleStep } from "@/components/ledger/journey/host/SettleStep";
import {
  AddExpenseSheet,
  type AddExpenseTab,
} from "@/components/ledger/journey/host/AddExpenseSheet";
import { useOptionalToast } from "@/components/ds/Toast";
import {
  TripIntentSheet,
  type TripIntent,
} from "@/components/trips/TripIntentSheet";
import { TripBotSheet } from "@/components/trips/TripBotSheet";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { ExpenseDraftInput } from "@/lib/ledger/draft";
import { fetchTripInboxCount } from "@/lib/ledger/inbox-count";
import {
  fetchOpenBudgetSuggestions,
  type OpenBudgetSuggestion,
} from "@/lib/ledger/open-suggestions";
import {
  buildLocalInsight,
  computeLedgerStats,
} from "@/lib/ledger/stats";
import {
  ensureOwnerMember,
  listCardProfiles,
  listExpenses,
  listMembers,
} from "@/lib/ledger/supabase";
import type { LedgerExpenseRow, TripMember } from "@/lib/ledger/types";
import { formatKRW } from "@/lib/shared/format";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useTrips } from "@/lib/trips/TripProvider";

import type { LedgerCardProfile, LedgerShellProps } from "./ledger-shell-types";
import { newManualDraft, readEntryIntent } from "./ledger-shell-utils";

type Props = LedgerShellProps;

export function LedgerShell({
  tripId,
  step = "record",
  onNavigate,
}: Props) {
  const router = useRouter();
  const { user, provider, isAnonymous } = useAuth();
  const { getTrip } = useTrips();
  const searchParams = useSearchParams();
  const intent = readEntryIntent(searchParams);
  /** UI 숨김만. 권한은 서버 라우트·RLS가 최종 방어. */
  const guestReadonly = isAnonymous;
  const handledIntent = useRef<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const toast = useOptionalToast();
  const [addTab, setAddTab] = useState<AddExpenseTab | null>(null);
  const [addFocusFirst, setAddFocusFirst] = useState(false);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [expenses, setExpenses] = useState<LedgerExpenseRow[]>([]);
  const [profiles, setProfiles] = useState<LedgerCardProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queue, setQueue] = useState<ExpenseDraftInput[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [cancelNotice, setCancelNotice] = useState<ExpenseDraftInput | null>(
    null
  );
  const [budget] = useState(0);
  const [insight, setInsight] = useState<ReturnType<
    typeof buildLocalInsight
  > | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [inboxCount, setInboxCount] = useState(0);
  const [openSuggestions, setOpenSuggestions] = useState<
    OpenBudgetSuggestion[]
  >([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [intentOpen, setIntentOpen] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [botOpen, setBotOpen] = useState(false);

  const tripMeta = useMemo(() => {
    const trip = getTrip(tripId);
    const planAllocation = (trip?.budgetAllocation ?? []).map((a) => ({
      id: a.id,
      label: a.label,
      amount: a.amount,
    }));
    let tripDays = 1;
    if (trip?.startDate && trip?.endDate) {
      const a = Date.parse(`${trip.startDate}T00:00:00Z`);
      const b = Date.parse(`${trip.endDate}T00:00:00Z`);
      if (Number.isFinite(a) && Number.isFinite(b) && b >= a) {
        tripDays = Math.floor((b - a) / 86_400_000) + 1;
      }
    } else if (trip?.dailySchedule && trip.dailySchedule.length > 0) {
      tripDays = trip.dailySchedule.length;
    }
    return {
      planAllocation,
      tripBudgetKrw: trip?.budget ?? 0,
      tripDays,
    };
  }, [getTrip, tripId]);

  const planAllocation = tripMeta.planAllocation;

  const reload = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase || !user || provider === "guest") {
      setLoading(false);
      setError("가계부는 로그인 후 이용할 수 있어요.");
      return;
    }
    setError("");
    let m = await listMembers(supabase, tripId);
    if (m.length === 0) {
      await ensureOwnerMember(
        supabase,
        tripId,
        user.id,
        user.user_metadata?.name?.trim() ||
          user.user_metadata?.nickname?.trim() ||
          "나"
      );
      m = await listMembers(supabase, tripId);
    }
    const owner = m.find((row) => row.isOwner && row.userId === user.id);
    const [e, p, pendingCount, suggestions] = await Promise.all([
      listExpenses(supabase, tripId),
      listCardProfiles(supabase),
      fetchTripInboxCount(supabase, {
        tripId,
        userId: user.id,
        includeProposals: Boolean(owner),
      }),
      owner
        ? fetchOpenBudgetSuggestions(supabase, tripId)
        : Promise.resolve([] as OpenBudgetSuggestion[]),
    ]);
    setMembers(m);
    setExpenses(e);
    setProfiles(p as LedgerCardProfile[]);
    setInboxCount(pendingCount);
    setOpenSuggestions(suggestions);
    setLoading(false);
  }, [tripId, user, provider]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const total = expenses.reduce((s, e) => s + e.krwAmount, 0);
  const me = members.find((m) => m.userId === user?.id) ?? members[0];

  function openDrafts(drafts: ExpenseDraftInput[]) {
    setAddTab(null);
    setQueue(drafts);
    setQueueIndex(0);
  }

  function openAdd(tab: AddExpenseTab) {
    setAddFocusFirst(false);
    setAddTab(tab);
  }

  function handleTripIntent(selected: TripIntent) {
    if (selected === "schedule") {
      router.push(`/trips/${tripId}`);
      return;
    }
    if (selected === "expense") {
      openAdd("paste");
      return;
    }
    if (selected === "split") {
      onNavigate?.("adjust");
      return;
    }
    if (selected === "cash") {
      setCashOpen(true);
      return;
    }
    if (selected === "bot") {
      setBotOpen(true);
    }
  }

  // 가계부 탭의 바로가기: manual 은 확인 시트를 바로 열고, receipt/voice 는 지출 추가 시트를
  // 그 탭으로 열어 첫 버튼에 포커스만 준다. 파일 선택창은 사용자 제스처가 필요해서 열지 않는다.
  const canEnter = !loading && members.length > 0 && !guestReadonly;
  useEffect(() => {
    if (!intent || !canEnter || handledIntent.current === intent) return;
    handledIntent.current = intent;
    if (intent === "manual") {
      setQueue([newManualDraft()]);
      setQueueIndex(0);
      return;
    }
    if (intent === "cash") {
      setCashOpen(true);
      return;
    }
    if (intent === "settings-fx") {
      setSettingsOpen(true);
      return;
    }
    // receipt/voice: record 단계에서만 (TripJourney가 step=record로 정규화)
    if (step !== "record") return;
    setAddFocusFirst(true);
    setAddTab(intent === "receipt" ? "receipt" : "voice");
  }, [intent, canEnter, step]);

  if (loading) {
    return (
      <div className="h-48 animate-pulse rounded-2xl bg-mu-sunken" aria-busy />
    );
  }

  const showConnect = step === "connect";
  const showInvite = step === "invite";
  const showRecord = step === "record";
  const showAdjust = step === "adjust";
  const showSettle = step === "settle";
  const showPay = step === "pay";

  const dashboard = (
    <LedgerDashboard
      expenses={expenses}
      members={members}
      budget={budget || Math.max(total, 1)}
      insight={insight}
      insightLoading={insightLoading}
      embedded={!guestReadonly}
      onRefreshInsight={() => {
        setInsightLoading(true);
        try {
          const stats = computeLedgerStats({
            expenses,
            budget: budget || Math.max(total, 1),
          });
          setInsight(buildLocalInsight(stats));
        } finally {
          setInsightLoading(false);
        }
      }}
    />
  );

  return (
    <div
      className={
        showSettle
          ? "mx-auto flex w-full max-w-mobile flex-col"
          : "mx-auto flex w-full max-w-mobile flex-col gap-5 px-4 pb-28 pt-3"
      }
    >
      {guestReadonly ? (
        <p className="text-mu-caption text-mu-fg-3">
          합계 <span className="mu-num font-bold text-mu-fg">{formatKRW(total)}</span>
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-mu-lg border border-mu-err/20 bg-mu-err-soft px-3 py-3 text-mu-body font-semibold text-mu-err"
        >
          {error}
        </p>
      ) : null}

      {members.length === 0 ? (
        <p className="text-sm text-mu-fg-2">동행자를 먼저 추가해 주세요.</p>
      ) : (
        <>
          {showConnect && !guestReadonly ? (
            <ConnectStep
              tripId={tripId}
              onLater={() => onNavigate?.("invite")}
            />
          ) : null}

          {showInvite && !guestReadonly ? (
            <InviteStep
              tripId={tripId}
              members={members}
              canInvite={Boolean(me?.isOwner && me.userId === user?.id)}
              onMembersChanged={setMembers}
            />
          ) : null}

          {showRecord ? (
            <>
              {guestReadonly && user && me ? (
                <GuestExpenseSlot
                  tripId={tripId}
                  members={members}
                  meId={me.id}
                  userId={user.id}
                />
              ) : guestReadonly ? (
                <p className="text-xs text-mu-fg-3">
                  호스트가 승인하면 정산에 들어가요.
                </p>
              ) : null}

              {guestReadonly ? (
                <LedgerShellGuestRecord
                  tripId={tripId}
                  expenses={expenses}
                  members={members}
                  meId={me?.id}
                  isAnonymous={isAnonymous}
                  isOwner={Boolean(me?.isOwner)}
                  dashboard={dashboard}
                  onExpenseChanged={() => void reload()}
                />
              ) : (
                <RecordStep
                  tripId={tripId}
                  expenses={expenses}
                  members={members}
                  inboxCount={inboxCount}
                  openSuggestions={openSuggestions}
                  onSuggestionSettled={() => void reload()}
                  cancelNotice={cancelNotice}
                  onDismissCancel={() => setCancelNotice(null)}
                  onOpenAdd={openAdd}
                  onOpenIntent={() => setIntentOpen(true)}
                  onAdjust={() => onNavigate?.("adjust")}
                  onSettle={() => onNavigate?.("settle")}
                  dashboard={dashboard}
                  planAllocation={planAllocation}
                  tripBudgetKrw={tripMeta.tripBudgetKrw}
                  tripDays={tripMeta.tripDays}
                />
              )}
            </>
          ) : null}

          {showAdjust ? (
            <AdjustStep
              tripId={tripId}
              expenses={expenses}
              members={members}
              meId={me?.id}
              isOwner={Boolean(me?.isOwner)}
              isAnonymous={isAnonymous}
              onChanged={() => void reload()}
              onSettle={() => onNavigate?.("settle")}
              onRecord={() => onNavigate?.("record")}
            />
          ) : null}

          {showSettle ? (
            <SettleStep
              tripId={tripId}
              mode="journey"
              onAdjust={() => onNavigate?.("adjust")}
              onPay={() => onNavigate?.("pay")}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          ) : null}

          {showPay ? (
            <PayStep
              tripId={tripId}
              mode="journey"
              onSettle={() => onNavigate?.("settle")}
              onRecap={() => {
                window.location.href = `/trips/${tripId}/ledger/recap`;
              }}
            />
          ) : null}
        </>
      )}

      {!guestReadonly ? (
        <LedgerShellSettingsSheet
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settingsRef={settingsRef}
          tripId={tripId}
          userId={user?.id}
          me={me}
          members={members}
          profiles={profiles}
          onProfilesChange={setProfiles}
          onTransferred={() => {
            void reload();
          }}
        />
      ) : null}

      {!guestReadonly ? (
        <>
          <TripIntentSheet
            open={intentOpen}
            onClose={() => setIntentOpen(false)}
            onSelect={handleTripIntent}
          />
          <CashWithdrawSheet
            open={cashOpen}
            onClose={() => setCashOpen(false)}
            onDraft={(draft) => openDrafts([draft])}
          />
          <TripBotSheet
            tripId={tripId}
            open={botOpen}
            onClose={() => setBotOpen(false)}
          />
          <AddExpenseSheet
            tripId={tripId}
            tab={addTab}
            onTabChange={setAddTab}
            onClose={() => setAddTab(null)}
            focusFirst={addFocusFirst}
            onDrafts={openDrafts}
            onCancelNotice={(draft) => {
              setAddTab(null);
              setCancelNotice(draft);
            }}
            onManual={() => openDrafts([newManualDraft()])}
          />
        </>
      ) : null}

      {queue.length > 0 && !guestReadonly ? (
        <ExpenseConfirmSheet
          tripId={tripId}
          members={members}
          drafts={queue}
          index={queueIndex}
          onIndexChange={setQueueIndex}
          onClose={() => setQueue([])}
          onSaved={() => {
            void reload();
            toast?.show({ text: "지출을 저장했어요", tone: "ok" });
          }}
          cardProfiles={profiles}
        />
      ) : null}
    </div>
  );
}