import {
  showConnectStepper,
  type ConnectState,
} from "@/lib/onboarding/connect-machine";

type ConnectFlowToolbarProps = {
  state: ConnectState;
  onSkip: () => void;
  onBackToHub: () => void;
};

export function ConnectFlowToolbar({
  state,
  onSkip,
  onBackToHub,
}: ConnectFlowToolbarProps) {
  const showLater =
    showConnectStepper(state) && state.issueMode === "wizard";

  return (
    <div className="flex items-start justify-between gap-3">
      {showLater ? (
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-mu-fg-2">
            연결은 나중에 해도 돼요
          </p>
          <button
            type="button"
            className="min-h-11 px-1 text-sm font-semibold text-mu-fg-2 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
            disabled={state.busy === "skip"}
            aria-busy={state.busy === "skip"}
            onClick={onSkip}
          >
            나중에 하기
          </button>
        </div>
      ) : (
        <span className="flex-1" />
      )}
      {state.phase !== "hub" &&
      state.issueMode !== "wizard" &&
      state.phase !== "done" &&
      state.phase !== "skipped" ? (
        <button
          type="button"
          className="min-h-11 shrink-0 px-2 text-sm font-semibold text-mu-fg-2 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-accent"
          onClick={onBackToHub}
        >
          연결 관리로
        </button>
      ) : null}
    </div>
  );
}