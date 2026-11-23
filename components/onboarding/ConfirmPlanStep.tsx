"use client";

import { useMemo } from "react";
import { ConfirmPlanBudgetSection } from "@/components/onboarding/ConfirmPlanBudgetSection";
import { ConfirmPlanDatesSection } from "@/components/onboarding/ConfirmPlanDatesSection";
import { ConfirmPlanDestinationSection } from "@/components/onboarding/ConfirmPlanDestinationSection";
import { ConfirmPlanNlFill } from "@/components/onboarding/ConfirmPlanNlFill";
import { ConfirmPlanPeopleSection } from "@/components/onboarding/ConfirmPlanPeopleSection";
import { ConfirmPlanStylesSection } from "@/components/onboarding/ConfirmPlanStylesSection";
import { parseBudgetAmount } from "@/lib/ai/budget-insight";
import { buildDisplayAllocation } from "@/lib/onboarding/display-allocation";
import type { OnboardingForm } from "@/lib/onboarding/types";

export type ConfirmPlanStepProps = {
  form: OnboardingForm;
  /** AI 한 줄 입력. 채우기 후 아래 필드를 갱신해요 */
  freeText: string;
  onFreeTextChange: (value: string) => void;
  onChange: (patch: Partial<OnboardingForm>) => void;
};

export function ConfirmPlanStep({
  form,
  freeText,
  onFreeTextChange,
  onChange,
}: ConfirmPlanStepProps) {
  const budget = parseBudgetAmount(form.budget);
  const segments = useMemo(() => buildDisplayAllocation(budget), [budget]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-mu-title font-bold text-mu-fg">
          좋아요! 이렇게 짜볼게요
        </h2>
        <p className="text-mu-body text-mu-fg-2">
          예산 안에서 일정을 잡아 드릴게요. 한 줄로 말하면 아래를 채워 드려요.
        </p>
      </div>

      <ConfirmPlanBudgetSection budget={budget} segments={segments} />

      <ConfirmPlanNlFill
        form={form}
        freeText={freeText}
        onFreeTextChange={onFreeTextChange}
        onChange={onChange}
      />

      <ConfirmPlanDestinationSection form={form} onChange={onChange} />
      <ConfirmPlanDatesSection form={form} onChange={onChange} />
      <ConfirmPlanPeopleSection form={form} onChange={onChange} />
      <ConfirmPlanStylesSection form={form} onChange={onChange} />
    </div>
  );
}
