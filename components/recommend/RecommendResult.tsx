"use client";

import { useRouter } from "next/navigation";
import { PrimaryFooter } from "@/components/ds";
import { EasterEggCelebration } from "@/components/ui/EasterEggCelebration";
import { planToTrip } from "@/components/recommend/planToTrip";
import { RecommendResultBudgetStatus } from "@/components/recommend/RecommendResultBudgetStatus";
import { RecommendResultHeader } from "@/components/recommend/RecommendResultHeader";
import { RecommendResultNotices } from "@/components/recommend/RecommendResultNotices";
import { RecommendResultSchedule } from "@/components/recommend/RecommendResultSchedule";
import type { RecommendResultProps } from "@/components/recommend/recommend-result.types";
import { useRecommendResultPlan } from "@/components/recommend/useRecommendResultPlan";
import { useTrips } from "@/lib/trips/TripProvider";

export function RecommendResult({
  plan: initialPlan,
  enrich = false,
  demoFxExample: _demoFxExample = false,
}: RecommendResultProps) {
  const router = useRouter();
  const { addTrip } = useTrips();
  const {
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
  } = useRecommendResultPlan(initialPlan, enrich);

  const handleSave = async () => {
    if (budgetExceeded || saving) return;
    setSaving(true);
    try {
      const trip = planToTrip(
        plan,
        flightPrice,
        flightAirline,
        hotelPrice,
        hotelName
      );
      const saved = await addTrip(trip);
      router.push(`/trips/${saved.id}`);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-mu-bg">
      <EasterEggCelebration
        open={showEasterCelebration}
        destination={plan.destination}
        onClose={closeEasterCelebration}
      />

      <RecommendResultHeader
        destination={plan.destination}
        dateRange={plan.dateRange}
        nights={plan.nights}
        onBack={() => router.push("/onboarding")}
        onEdit={() => router.push("/onboarding")}
      />

      <div className="flex flex-col gap-5 px-5 pb-36 pt-5">
        <RecommendResultNotices
          enriching={enriching}
          enrichNotice={enrichNotice}
          routeOptimizeNotice={routeOptimizeNotice}
          routeOptimizing={routeOptimizing}
          isEasterEgg={isEasterEgg}
          easterSummary={plan.summary}
        />

        <RecommendResultBudgetStatus
          slack={slack}
          plannedTotal={plannedTotal}
          totalBudget={plan.totalBudget}
        />

        {isUnrealistic ? (
          <section className="rounded-mu-xl border border-mu-line bg-mu-card p-5">
            <p className="text-mu-body leading-relaxed text-mu-fg-2">
              지금은 현실적인 일정을 만들기 어려워요. 예산을 올리거나 인원·목적지를
              바꾼 뒤 다시 추천받아 보세요.
            </p>
          </section>
        ) : (
          <RecommendResultSchedule
            dayTabs={dayTabs}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            activeDay={activeDay}
            enriching={enriching}
            routeOptimizing={routeOptimizing}
          />
        )}
      </div>

      {!isUnrealistic && !budgetExceeded ? (
        <PrimaryFooter
          label={saving ? "저장 중…" : "이 일정으로 확정하기"}
          onClick={() => {
            void handleSave();
          }}
          loading={saving}
          disabled={saving || enriching}
          secondary={{
            label: "조건 다시 입력하기",
            onClick: () => router.push("/onboarding"),
          }}
        />
      ) : (
        <PrimaryFooter
          label="조건 다시 입력하기"
          onClick={() => router.push("/onboarding")}
        />
      )}
    </div>
  );
}