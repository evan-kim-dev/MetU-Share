"use client";

import { ConnectError } from "@/components/onboarding/connect/ConnectError";
import { ConnectFlowBooting } from "@/components/onboarding/connect/ConnectFlowBooting";
import { ConnectFlowGuestPrompt } from "@/components/onboarding/connect/ConnectFlowGuestPrompt";
import { ConnectFlowToolbar } from "@/components/onboarding/connect/ConnectFlowToolbar";
import { ConnectHub } from "@/components/onboarding/connect/ConnectHub";
import { GateNotice } from "@/components/onboarding/connect/GateNotice";
import { RecentEventsStrip } from "@/components/onboarding/connect/RecentEventsStrip";
import { StepAutomation } from "@/components/onboarding/connect/StepAutomation";
import { StepCode } from "@/components/onboarding/connect/StepCode";
import { StepDevice } from "@/components/onboarding/connect/StepDevice";
import { StepShortcut } from "@/components/onboarding/connect/StepShortcut";
import { StepVerify } from "@/components/onboarding/connect/StepVerify";
import { UnsupportedHandoff } from "@/components/onboarding/connect/UnsupportedHandoff";
import { useConnectFlow } from "@/components/onboarding/connect/useConnectFlow";
import { Stepper, type StepItem } from "@/components/ds/Stepper";
import type { UserFacingError } from "@/lib/errors/user-message";
import {
  connectStepCards,
  showConnectStepper,
  stepLabel,
  type ConnectStepPhase,
} from "@/lib/onboarding/connect-machine";
import {
  eventsSince,
  newestRealEvent,
} from "@/lib/onboarding/last-device-event";
import { clearSnapshot } from "@/lib/onboarding/connect-storage";

export function ConnectFlow() {
  const {
    router,
    isReady,
    isGuest,
    booted,
    state,
    dispatch,
    toast,
    serverTestError,
    waitingMs,
    pollingStopped,
    prevEventCount,
    gate,
    nextPath,
    showStrip,
    status,
    activeTokenCount,
    refreshTokenMeta,
    issueToken,
    skip,
    enterVerify,
    serverTest,
    finish,
    nowIso,
    resumePolling,
    pasteHref,
    hubUiState,
    lastAt,
    trips,
  } = useConnectFlow();

  if (!isReady || !booted) {
    return <ConnectFlowBooting />;
  }

  if (isGuest) {
    return <ConnectFlowGuestPrompt />;
  }

  const stepperItems: StepItem[] = connectStepCards(state).map((card) => ({
    key: card.phase,
    label: card.label,
    status:
      card.status === "upcoming"
        ? "todo"
        : card.status === "done"
          ? "done"
          : "current",
  }));

  const sinceEvents = eventsSince(
    status.data?.recentEvents ?? [],
    state.verifyStartedAt
  );
  const realEvent = state.realOk ? newestRealEvent(sinceEvents) : null;
  const realEventTripLabel =
    realEvent?.tripId != null
      ? (trips.find((t) => t.id === realEvent.tripId)?.destination ?? null)
      : null;

  const userError: UserFacingError | null = state.error
    ? {
        code: state.error.code,
        message: state.error.message,
        retryable: state.error.retryable,
        retryAfterSec: state.error.retryAfterSec,
        action: state.error.action as UserFacingError["action"],
        operatorHint: state.error.operatorHint,
      }
    : null;

  return (
    <div className="flex flex-col gap-4">
      {showConnectStepper(state) ? (
        <div className="-mx-5">
          <Stepper
            steps={stepperItems}
            currentKey={state.phase}
            title={stepLabel(state)}
            navAriaLabel="연결 단계"
            onSelect={(key) =>
              dispatch({
                type: "GO_TO_STEP",
                phase: key as ConnectStepPhase,
              })
            }
          />
        </div>
      ) : null}

      <ConnectFlowToolbar
        state={state}
        onSkip={() => void skip()}
        onBackToHub={() => {
          clearSnapshot();
          dispatch({ type: "BACK_TO_HUB" });
          void refreshTokenMeta();
        }}
      />

      {state.phase !== "hub" ? (
        <GateNotice gate={gate} nextPath={nextPath} />
      ) : null}

      {userError ? (
        <ConnectError
          error={userError}
          onRetry={() => {
            dispatch({ type: "DISMISS_ERROR" });
            if (state.phase === "code") {
              void issueToken(state.issueMode === "reissue");
            }
          }}
          onReissue={() => dispatch({ type: "REISSUE_REQUEST" })}
          onLogin={() => router.push("/login?next=/onboarding/automation")}
          onOpenGuide={() =>
            router.push(
              `/onboarding/shortcut-guide?platform=${
                state.platform === "android" ? "android" : "ios"
              }`
            )
          }
        />
      ) : null}

      {state.phase === "hub" ? (
        <ConnectHub
          uiState={hubUiState}
          activeTokenCount={activeTokenCount}
          lastNotificationAt={lastAt}
          pasteHref={pasteHref}
          onVerify={() => dispatch({ type: "RESUME_VERIFY", at: nowIso() })}
          onAddDevice={() => {
            void refreshTokenMeta().then(() =>
              dispatch({ type: "START_ADD_DEVICE" })
            );
          }}
          onReissue={() => dispatch({ type: "START_REISSUE" })}
        />
      ) : null}

      {state.phase === "device" ? (
        <StepDevice
          platform={state.platform}
          onIos27={(v) => dispatch({ type: "SET_IOS27", value: v })}
          onAndroidNext={() =>
            dispatch({ type: "PLATFORM_DETECTED", platform: "android" })
          }
        />
      ) : null}

      {state.phase === "unsupported" ? (
        <UnsupportedHandoff
          reason={state.ios27 === false ? "ios-low" : "desktop"}
          skipBusy={state.busy === "skip"}
          onSkip={() => void skip()}
          onBackToDevice={() => dispatch({ type: "BACK_TO_DEVICE" })}
        />
      ) : null}

      {state.phase === "code" ? (
        <StepCode
          platform={state.platform}
          token={state.token.plain ?? null}
          copied={state.token.copied}
          needsToken={state.needsToken}
          issuing={state.busy === "issue"}
          reissueOpen={state.reissueOpen}
          toast={toast}
          onIssue={() =>
            void issueToken(state.issueMode === "reissue")
          }
          onCopyResult={(ok) => dispatch({ type: "COPY_RESULT", ok })}
          onNext={() => dispatch({ type: "CODE_NEXT" })}
          onReissueRequest={() => dispatch({ type: "REISSUE_REQUEST" })}
          onReissueConfirm={() => void issueToken(true)}
          onReissueCancel={() => {
            if (state.issueMode === "reissue" && !state.token.plain) {
              clearSnapshot();
              dispatch({ type: "BACK_TO_HUB" });
              return;
            }
            dispatch({ type: "REISSUE_CANCEL" });
          }}
        />
      ) : null}

      {state.phase === "shortcut" ? (
        <StepShortcut
          token={state.token.plain ?? null}
          copied={state.token.copied}
          needsToken={state.needsToken}
          onOpenShortcut={() => dispatch({ type: "OPEN_SHORTCUT" })}
          onCopyResult={(ok) => dispatch({ type: "COPY_RESULT", ok })}
          onConfirmAdded={() => dispatch({ type: "CONFIRM_ADDED" })}
          onReissueRequest={() => dispatch({ type: "REISSUE_REQUEST" })}
        />
      ) : null}

      {state.phase === "automation" ? (
        <StepAutomation
          platform={state.platform}
          token={state.token.plain ?? null}
          selectedApps={state.selectedApps}
          onSelectedApps={(apps) =>
            dispatch({ type: "SET_SELECTED_APPS", apps })
          }
          onConfirm={() => void enterVerify()}
        />
      ) : null}

      {state.phase === "verify" ? (
        <StepVerify
          state={state}
          platform={state.platform}
          events={status.data?.recentEvents ?? []}
          eventsLoading={status.loading}
          rateSlow={status.rateSlow}
          serverTestError={serverTestError}
          waitingMs={waitingMs}
          pollingStopped={pollingStopped}
          realEvent={realEvent}
          realEventTripLabel={realEventTripLabel}
          finishing={state.busy === "finish"}
          testing={state.busy === "server-test"}
          onServerTest={() => void serverTest()}
          onRetryServerTest={() => void serverTest()}
          onResumePolling={resumePolling}
          onFinishDone={() => void finish("done")}
          onFinishPartial={() => void finish("partial")}
        />
      ) : null}

      {showStrip && state.phase !== "verify" ? (
        <RecentEventsStrip
          events={status.data?.recentEvents ?? []}
          announceArrival
          prevCount={prevEventCount.current}
        />
      ) : null}

      {state.phase === "done" || state.phase === "skipped" ? (
        <p role="status" className="text-sm text-mu-fg-2">
          이동하는 중…
        </p>
      ) : null}
    </div>
  );
}