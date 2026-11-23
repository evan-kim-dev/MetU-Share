"use client";

import { AgentInboxEditSheet } from "@/components/agent/AgentInboxEditSheet";
import { AgentInboxGuestPrompt } from "@/components/agent/AgentInboxGuestPrompt";
import { AgentInboxList } from "@/components/agent/AgentInboxList";
import { AgentInboxToolbar } from "@/components/agent/AgentInboxToolbar";
import type { AgentInboxProps } from "@/components/agent/agent-inbox-types";
import { useAgentInbox } from "@/components/agent/useAgentInbox";
import { MobileShell } from "@/components/layout/MobileShell";
import { QuickTripSheet } from "@/components/trips/QuickTripSheet";

export function AgentInbox({
  tripId,
  trips: tripsProp,
  embedded = false,
}: AgentInboxProps) {
  const inbox = useAgentInbox({ tripId, trips: tripsProp });

  const body = (
    <>
      {!embedded ? (
        <p className="text-xs leading-relaxed text-mu-fg-2">
          확정 전 대기열이에요. 확인하면 가계부에 들어가요.
        </p>
      ) : null}

      {inbox.isGuest ? (
        <AgentInboxGuestPrompt tripId={tripId} />
      ) : (
        <>
          <AgentInboxToolbar
            unassignedCount={inbox.unassignedCount}
            filterUnassigned={inbox.filterUnassigned}
            onToggleFilter={() => inbox.setFilterUnassigned((v) => !v)}
            noTrips={inbox.noTrips}
            onOpenTripSheet={() => inbox.setSheetOpen(true)}
            error={inbox.error}
            reloadBusy={inbox.reloadBusy}
            onReload={inbox.reload}
            offlineHint={inbox.offlineHint}
            hasEvents={inbox.events.length > 0}
          />
          <AgentInboxList
            loading={inbox.loading}
            error={inbox.error}
            groups={inbox.groups}
            bulkGroups={inbox.bulkGroups}
            bulk={inbox.bulk}
            trips={inbox.trips}
            activeTrips={inbox.activeTrips}
            suggestions={inbox.suggestions}
            rowErrors={inbox.rowErrors}
            busyId={inbox.busyId}
            ignoredOpen={inbox.ignoredOpen}
            connectHref={inbox.connectHref}
            connected={inbox.connected}
            onToggleIgnored={() => inbox.setIgnoredOpen((v) => !v)}
            onAttachAll={(id, ids) => void inbox.attachAll(id, ids)}
            onOpenTripSheet={() => inbox.setSheetOpen(true)}
            onOpenEdit={inbox.openEdit}
            post={inbox.post}
            withBusy={inbox.withBusy}
          />
        </>
      )}
    </>
  );

  const sheets = (
    <>
      <AgentInboxEditSheet
        editEvent={inbox.editEvent}
        editText={inbox.editText}
        editMerchant={inbox.editMerchant}
        editAmount={inbox.editAmount}
        editCurrency={inbox.editCurrency}
        editSpentOn={inbox.editSpentOn}
        busyId={inbox.busyId}
        onClose={() => inbox.setEditEvent(null)}
        onSave={() => void inbox.saveEdit()}
        onEditText={inbox.setEditText}
        onEditMerchant={inbox.setEditMerchant}
        onEditAmount={inbox.setEditAmount}
        onEditCurrency={inbox.setEditCurrency}
        onEditSpentOn={inbox.setEditSpentOn}
      />

      <QuickTripSheet
        open={inbox.sheetOpen}
        onClose={() => inbox.setSheetOpen(false)}
        onCreated={inbox.onTripCreated}
        reason="inbox"
      />
    </>
  );

  if (embedded) {
    return (
      <>
        {body}
        {sheets}
      </>
    );
  }

  return (
    <MobileShell
      title="확인함"
      showBack={Boolean(tripId)}
      backHref={inbox.backHref}
      showBottomNav
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4">
        {body}
      </div>
      {sheets}
    </MobileShell>
  );
}
