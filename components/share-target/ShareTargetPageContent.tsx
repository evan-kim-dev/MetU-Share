"use client";

import {
  ShareTargetGuestGate,
  ShareTargetLoading,
} from "@/components/share-target/ShareTargetGate";
import { ShareTargetForm } from "@/components/share-target/ShareTargetForm";
import { useShareTarget } from "@/components/share-target/useShareTarget";

export function ShareTargetPageContent() {
  const {
    router,
    searchParams,
    user,
    provider,
    authReady,
    tripsReady,
    tripId,
    setTripId,
    members,
    profiles,
    pending,
    loadError,
    processError,
    processing,
    queue,
    setQueue,
    queueIndex,
    setQueueIndex,
    shareCapable,
    activeTrips,
    openDrafts,
  } = useShareTarget();

  if (!authReady || !tripsReady) {
    return <ShareTargetLoading />;
  }

  if (!user || provider === "guest") {
    return <ShareTargetGuestGate searchParams={searchParams} />;
  }

  return (
    <ShareTargetForm
      shareCapable={shareCapable}
      loadError={loadError}
      processError={processError}
      processing={processing}
      tripId={tripId}
      setTripId={setTripId}
      activeTrips={activeTrips}
      pending={pending}
      members={members}
      queue={queue}
      queueIndex={queueIndex}
      setQueueIndex={setQueueIndex}
      setQueue={setQueue}
      profiles={profiles}
      openDrafts={openDrafts}
      onSaved={() => {
        setQueue([]);
        router.push(`/trips/${tripId}/ledger`);
      }}
    />
  );
}
