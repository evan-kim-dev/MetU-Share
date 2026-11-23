"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import { useClipboardCopy } from "@/components/onboarding/connect/useClipboardCopy";
import {
  toConnectError,
  type TestRes,
  type TokenRes,
  type TokensListRes,
} from "@/components/onboarding/connect/connect-flow-types";
import { apiFetchJson } from "@/lib/api/fetch-json";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolvePostOnboardingPath } from "@/lib/auth/post-login-path";
import type { UserFacingError } from "@/lib/errors/user-message";
import { toUserFacingError } from "@/lib/errors/user-message";
import { useAutomationStatus } from "@/lib/hooks/useAutomationStatus";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { detectPlatform } from "@/lib/onboarding/automation";
import { shouldEnterConnectHub } from "@/lib/onboarding/connect-entry";
import {
  connectReducer,
  initialConnectState,
  pickVerifyArrival,
  toSnapshot,
} from "@/lib/onboarding/connect-machine";
import {
  clearSnapshot,
  loadSnapshot,
  saveSnapshot,
} from "@/lib/onboarding/connect-storage";
import {
  defaultTokenLabelForPlatform,
  nextTokenLabel,
} from "@/lib/onboarding/token-label";
import { useTrips } from "@/lib/trips/TripProvider";

export function useConnectFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady, provider } = useAuth();
  const isGuest = provider === "guest";
  const online = useOnlineStatus();
  const { activeTrips, trips } = useTrips();
  const [state, dispatch] = useReducer(connectReducer, undefined, () =>
    initialConnectState()
  );
  const [booted, setBooted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [serverTestError, setServerTestError] =
    useState<UserFacingError | null>(null);
  const [waitingMs, setWaitingMs] = useState(0);
  const [pollingStopped, setPollingStopped] = useState(false);
  const [pollEpoch, setPollEpoch] = useState(0);
  const [activeTokenCount, setActiveTokenCount] = useState(0);
  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  const prevPhase = useRef(state.phase);
  const prevEventCount = useRef(0);
  const bootStarted = useRef(false);
  const clockOffsetMs = useRef(0);
  const { copy } = useClipboardCopy();

  const gate = searchParams.get("gate");
  const nextPath = searchParams.get("next");

  const showStrip =
    state.phase === "code" ||
    state.phase === "shortcut" ||
    state.phase === "automation" ||
    state.phase === "verify";

  const bootStatus = useAutomationStatus({
    enabled: isReady && !isGuest && !booted,
    lite: true,
    cacheTtlMs: 0,
  });

  const status = useAutomationStatus({
    enabled:
      (showStrip &&
        !pollingStopped &&
        !(state.phase === "verify" && state.realOk)) ||
      state.phase === "hub",
    lite: state.phase !== "verify",
    intervalMs: state.phase === "verify" ? 5000 : 10_000,
    cacheTtlMs: 0,
  });

  const refreshTokenMeta = useCallback(async () => {
    const res = await apiFetchJson<TokensListRes>(
      "/api/agent/tokens",
      { method: "GET" },
      { source: "api" }
    );
    if (!res.ok) {
      setActiveTokenCount(0);
      setActiveLabels([]);
      return;
    }
    const active = res.data.tokens.filter((t) => !t.revoked);
    setActiveTokenCount(active.length);
    setActiveLabels(active.map((t) => t.label));
  }, []);

  useEffect(() => {
    if (!isReady || isGuest || bootStarted.current) return;
    const snap = loadSnapshot();
    if (snap && snap.phase !== "hub" && snap.phase !== "done" && snap.phase !== "skipped") {
      bootStarted.current = true;
      dispatch({ type: "RESTORE", snapshot: snap });
      setBooted(true);
      return;
    }
    if (bootStatus.loading) return;
    bootStarted.current = true;
    const platform = detectPlatform(navigator.userAgent);
    const data = bootStatus.data;
    if (
      data &&
      shouldEnterConnectHub({
        hasActiveToken: data.hasActiveToken,
        status: data.status,
      })
    ) {
      const hubPlatform =
        data.platform === "ios" || data.platform === "android"
          ? data.platform
          : platform === "ios" || platform === "android"
            ? platform
            : "ios";
      dispatch({
        type: "ENTER_HUB",
        platform: hubPlatform,
        ios27: hubPlatform === "ios" ? true : null,
      });
      void refreshTokenMeta();
    } else {
      dispatch({ type: "PLATFORM_DETECTED", platform });
    }
    setBooted(true);
  }, [
    isReady,
    isGuest,
    bootStatus.loading,
    bootStatus.data,
    refreshTokenMeta,
  ]);

  useEffect(() => {
    if (!booted) return;
    if (state.phase === "done" || state.phase === "skipped") {
      clearSnapshot();
      return;
    }
    if (state.phase === "device" || state.phase === "hub") return;
    saveSnapshot(toSnapshot(state));
  }, [state, booted]);

  useEffect(() => {
    if (prevPhase.current === state.phase) return;
    prevPhase.current = state.phase;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }
    const h2 = document.querySelector("h2");
    if (h2 instanceof HTMLElement) h2.focus();
  }, [state.phase]);

  const serverNow = status.data?.serverNow ?? bootStatus.data?.serverNow;
  useEffect(() => {
    if (!serverNow) return;
    const server = Date.parse(serverNow);
    if (Number.isFinite(server)) clockOffsetMs.current = server - Date.now();
  }, [serverNow]);

  const nowIso = useCallback(
    () => new Date(Date.now() + clockOffsetMs.current).toISOString(),
    []
  );

  useEffect(() => {
    if (state.phase !== "verify" || state.realOk || pollingStopped) return;
    const started = Date.now();
    const t = setInterval(() => {
      const elapsed = Date.now() - started;
      setWaitingMs(elapsed);
      if (elapsed >= 10 * 60 * 1000) setPollingStopped(true);
    }, 1000);
    return () => clearInterval(t);
  }, [state.phase, state.realOk, pollingStopped, pollEpoch]);

  useEffect(() => {
    if (state.phase !== "verify") return;
    const data = status.data;
    if (!data) return;
    const arrival = pickVerifyArrival(state.verifyStartedAt, data);
    if (arrival) {
      dispatch({ type: "EVENT_RECEIVED", kind: arrival.kind, at: arrival.at });
    }
  }, [status.data, state.phase, state.verifyStartedAt]);

  useEffect(() => {
    const n = status.data?.recentEvents.length ?? 0;
    if (n > prevEventCount.current) prevEventCount.current = n;
  }, [status.data?.recentEvents.length]);

  const issueToken = useCallback(
    async (replaceExisting: boolean) => {
      if (!online) {
        dispatch({
          type: "ISSUE_FAIL",
          error: toConnectError(toUserFacingError({ source: "network" })),
        });
        return;
      }
      if (state.platform !== "ios" && state.platform !== "android") {
        return;
      }
      dispatch({ type: "ISSUE_START" });
      const base = defaultTokenLabelForPlatform(state.platform);
      let label = base;
      if (state.issueMode === "add" && !replaceExisting) {
        label = nextTokenLabel(activeLabels, base);
      }
      const res = await apiFetchJson<TokenRes>(
        "/api/agent/tokens",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label, replaceExisting }),
        },
        { source: "api" }
      );
      if (!res.ok) {
        dispatch({ type: "ISSUE_FAIL", error: toConnectError(res.error) });
        return;
      }
      const ok = await copy(res.data.token);
      dispatch({
        type: "ISSUE_OK",
        token: res.data.token,
        issuedAt: res.data.createdAt,
      });
      dispatch({ type: "COPY_RESULT", ok });
      void refreshTokenMeta();
      if (replaceExisting) {
        const n = res.data.revokedCount ?? 0;
        setToast(
          n > 0
            ? `새 연결 코드로 바꿨어요. 이전 코드 ${n}개는 중지됐어요.`
            : "새 연결 코드를 만들었어요."
        );
      } else if (state.issueMode === "add") {
        setToast("새 기기용 연결 코드를 만들었어요.");
      }
    },
    [
      activeLabels,
      copy,
      online,
      refreshTokenMeta,
      state.issueMode,
      state.platform,
    ]
  );

  const saveOnboarding = useCallback(
    async (body: Record<string, unknown>) => {
      return apiFetchJson<{ ok: boolean }>(
        "/api/agent/onboarding",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        { source: "api" }
      );
    },
    []
  );

  const skip = useCallback(async () => {
    if (!online) {
      dispatch({
        type: "SKIP_FAIL",
        error: toConnectError(toUserFacingError({ source: "network" })),
      });
      return;
    }
    dispatch({ type: "SKIP_START" });
    const res = await saveOnboarding({
      status: "skipped",
      platform: state.platform,
    });
    if (!res.ok) {
      dispatch({ type: "SKIP_FAIL", error: toConnectError(res.error) });
      return;
    }
    dispatch({ type: "SKIP_OK" });
    clearSnapshot();
    router.replace(resolvePostOnboardingPath(window.location.search));
  }, [online, router, saveOnboarding, state.platform]);

  const enterVerify = useCallback(async () => {
    dispatch({ type: "CONFIRM_AUTOMATION", at: nowIso() });
    void saveOnboarding({
      status: "partial",
      platform: state.platform,
      selectedApps: state.selectedApps,
    });
  }, [nowIso, saveOnboarding, state.platform, state.selectedApps]);

  const serverTest = useCallback(async () => {
    if (!online) {
      setServerTestError(toUserFacingError({ source: "network" }));
      return;
    }
    dispatch({ type: "SERVER_TEST_START" });
    setServerTestError(null);
    const res = await apiFetchJson<TestRes>(
      "/api/agent/onboarding/test",
      { method: "POST" },
      { source: "api" }
    );
    if (!res.ok) {
      dispatch({
        type: "SERVER_TEST_FAIL",
        error: toConnectError(res.error),
      });
      setServerTestError(res.error);
      return;
    }
    dispatch({
      type: "SERVER_TEST_OK",
      duplicate: Boolean(res.data.duplicate),
    });
  }, [online]);

  const finish = useCallback(
    async (statusValue: "done" | "partial") => {
      if (!online) {
        dispatch({
          type: "FINISH_FAIL",
          error: toConnectError(toUserFacingError({ source: "network" })),
        });
        return;
      }
      dispatch({ type: "FINISH_START" });
      const res = await saveOnboarding({
        status: statusValue,
        platform: state.platform,
        selectedApps: state.selectedApps,
      });
      if (!res.ok) {
        dispatch({ type: "FINISH_FAIL", error: toConnectError(res.error) });
        return;
      }
      dispatch({ type: "FINISH_OK", status: statusValue });
      clearSnapshot();
      router.replace(resolvePostOnboardingPath(window.location.search));
    },
    [online, router, saveOnboarding, state.platform, state.selectedApps]
  );

  const resumePolling = useCallback(() => {
    setPollingStopped(false);
    setWaitingMs(0);
    setPollEpoch((e) => e + 1);
  }, []);

  const pasteTrip = activeTrips[0] ?? trips[0];
  const pasteHref = pasteTrip
    ? `/trips/${pasteTrip.id}/ledger`
    : "/agent";

  const hubUiState = status.uiState ?? bootStatus.uiState;
  const lastAt =
    status.data?.lastNotificationAt ??
    bootStatus.data?.lastNotificationAt ??
    null;

  return {
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
  };
}