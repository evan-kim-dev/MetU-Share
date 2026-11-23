"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePlanQuotes } from "@/components/recommend/usePlanQuotes";
import {
  markEasterCelebrated,
  wasEasterCelebrated,
} from "@/components/recommend/easter-celeb";
import { planHasEasterEgg } from "@/lib/ai/plan-easter-egg";
import { reallocateBudgetWithLiveQuotes } from "@/lib/ai/realloc-budget";
import type { TripRecommendation } from "@/lib/ai/types";
import { variableLimitFromPlan } from "@/lib/ai/plan-agent";
import { budgetPlanFromAllocation } from "@/lib/budget/adapters";
import { planEstimateKrw } from "@/lib/ledger/plan-estimate";

export function useRecommendResultPlan(
  initialPlan: TripRecommendation,
  enrich: boolean
) {
  const [plan, setPlan] = useState(initialPlan);
  const [enriching, setEnriching] = useState(enrich);
  const [enrichNotice, setEnrichNotice] = useState<"fallback" | "error" | null>(
    null
  );
  const [routeOptimizeNotice, setRouteOptimizeNotice] = useState(false);
  const [routeOptimizing, setRouteOptimizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() =>
    String(initialPlan.dailySchedule[0]?.day ?? 1)
  );
  const routeOptimizeAttemptedRef = useRef<Set<string>>(new Set());
  const routeOptimizeInflightRef = useRef(false);
  const { flightQuote, hotelQuote } = usePlanQuotes(plan);

  const isUnrealistic = plan.summaryTone === "factbomb";
  const isEasterEgg = planHasEasterEgg(plan);
  const [showEasterCelebration, setShowEasterCelebration] = useState(false);

  const closeEasterCelebration = useCallback(() => {
    setShowEasterCelebration(false);
    markEasterCelebrated(
      initialPlan.destination || initialPlan.form.destination
    );
  }, [initialPlan.destination, initialPlan.form.destination]);

  useEffect(() => {
    setPlan(initialPlan);
    setEnriching(enrich && initialPlan.summaryTone !== "factbomb");
    setEnrichNotice(null);
    routeOptimizeAttemptedRef.current.clear();
    setSelectedDay(String(initialPlan.dailySchedule[0]?.day ?? 1));
  }, [initialPlan.id, enrich]); // eslint-disable-line react-hooks/exhaustive-deps -- 새 폴백만 동기화

  useEffect(() => {
    if (!planHasEasterEgg(initialPlan)) {
      setShowEasterCelebration(false);
      return;
    }
    if (
      wasEasterCelebrated(
        initialPlan.destination || initialPlan.form.destination
      )
    ) {
      setShowEasterCelebration(false);
      return;
    }
    setShowEasterCelebration(true);
  }, [initialPlan]);

  useEffect(() => {
    if (!enrich || initialPlan.summaryTone === "factbomb") {
      setEnriching(false);
      return;
    }

    let cancelled = false;
    setEnriching(true);
    setEnrichNotice(null);

    void fetch("/api/onboarding/enrich-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form: initialPlan.form, plan: initialPlan }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("enrich-failed");
        return (await res.json()) as {
          plan?: TripRecommendation;
          scheduleSource?: "ai" | "fallback";
        };
      })
      .then((data) => {
        if (cancelled || !data.plan) return;
        setPlan(data.plan);
        if (
          data.scheduleSource === "fallback" ||
          data.plan.aiScheduleSource === "fallback"
        ) {
          setEnrichNotice("fallback");
        }
        const first = data.plan.dailySchedule[0]?.day;
        if (first != null) setSelectedDay(String(first));
      })
      .catch(() => {
        if (!cancelled) setEnrichNotice("error");
      })
      .finally(() => {
        if (!cancelled) setEnriching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enrich, initialPlan.id]); // eslint-disable-line react-hooks/exhaustive-deps -- 동일 일정 1회 보강

  useEffect(() => {
    if (isUnrealistic) return;
    if (enriching) return;
    if (plan.routeOptimization?.applied) return;
    if (routeOptimizeInflightRef.current) return;

    const fingerprint = plan.dailySchedule
      .map((d) => `${d.day}:${d.items.map((i) => i.title).join("|")}`)
      .join("||");
    const key = `${plan.id}::${fingerprint}`;
    if (routeOptimizeAttemptedRef.current.has(key)) return;
    routeOptimizeAttemptedRef.current.add(key);

    let cancelled = false;
    routeOptimizeInflightRef.current = true;
    setRouteOptimizing(true);

    void fetch("/api/route/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dailySchedule: plan.dailySchedule,
        destination: plan.destination,
        country: plan.country,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("route-optimize-failed");
        return (await res.json()) as {
          dailySchedule?: TripRecommendation["dailySchedule"];
          routeOptimization?: TripRecommendation["routeOptimization"];
        };
      })
      .then((data) => {
        if (cancelled || !data.dailySchedule) return;
        setPlan((prev) => ({
          ...prev,
          dailySchedule: data.dailySchedule!,
          routeOptimization: data.routeOptimization ?? prev.routeOptimization,
          tips:
            data.routeOptimization?.applied &&
            !prev.tips.some((t) => t.includes("유전 알고리즘"))
              ? [
                  "유전 알고리즘으로 하루 동선을 재배치해 이동을 줄였어요.",
                  ...prev.tips,
                ].slice(0, 10)
              : prev.tips,
        }));
      })
      .catch(() => {
        if (!cancelled) setRouteOptimizeNotice(true);
      })
      .finally(() => {
        routeOptimizeInflightRef.current = false;
        if (!cancelled) setRouteOptimizing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    isUnrealistic,
    enriching,
    plan.id,
    plan.destination,
    plan.country,
    plan.dailySchedule,
    plan.routeOptimization?.applied,
  ]);

  const flightPrice = flightQuote?.priceKrw ?? plan.flight.price;
  const flightAirline = flightQuote?.airline ?? plan.flight.airline;
  const hotelPrice = hotelQuote?.priceKrw ?? plan.hotel.total;
  const hotelName = hotelQuote?.name ?? plan.hotel.name;

  const liveBudget = useMemo(() => {
    const hasLive =
      flightQuote?.source === "live" ||
      hotelQuote?.source === "live" ||
      hotelQuote?.source === "city-estimate";
    if (!hasLive) {
      return {
        remaining: plan.totalBudget - plan.flight.price - plan.hotel.total,
        overBudget: false,
      };
    }
    const result = reallocateBudgetWithLiveQuotes(
      plan.budgetAllocation,
      plan.totalBudget,
      flightPrice,
      hotelPrice
    );
    return {
      remaining: result.remaining,
      overBudget: result.overBudget,
    };
  }, [
    plan.budgetAllocation,
    plan.totalBudget,
    plan.flight.price,
    plan.hotel.total,
    flightQuote?.source,
    hotelQuote?.source,
    flightPrice,
    hotelPrice,
  ]);

  const budgetPlan = useMemo(
    () =>
      budgetPlanFromAllocation({
        tripId: plan.id,
        total: plan.totalBudget,
        people: plan.people,
        allocation: plan.budgetAllocation,
      }),
    [plan.id, plan.totalBudget, plan.people, plan.budgetAllocation]
  );
  const scheduleEstimate =
    planEstimateKrw({
      dailySchedule: plan.dailySchedule,
      budgetAllocation: plan.budgetAllocation,
    }) ?? 0;
  const variableCap = variableLimitFromPlan(budgetPlan);
  const plannedTotal =
    Math.min(scheduleEstimate, variableCap) + flightPrice + hotelPrice;
  const slack = plan.totalBudget - plannedTotal;
  const budgetExceeded =
    liveBudget.overBudget || flightPrice + hotelPrice > plan.totalBudget;

  const dayTabs = plan.dailySchedule.map((d) => ({
    key: String(d.day),
    label: `${d.day}일차`,
  }));

  const activeDay =
    plan.dailySchedule.find((d) => String(d.day) === selectedDay) ??
    plan.dailySchedule[0];

  return {
    plan,
    enriching,
    enrichNotice,
    routeOptimizeNotice,
    routeOptimizing,
    saving,
    setSaving,
    selectedDay,
    setSelectedDay,
    isUnrealistic,
    isEasterEgg,
    showEasterCelebration,
    closeEasterCelebration,
    flightPrice,
    flightAirline,
    hotelPrice,
    hotelName,
    slack,
    plannedTotal,
    budgetExceeded,
    dayTabs,
    activeDay,
  };
}