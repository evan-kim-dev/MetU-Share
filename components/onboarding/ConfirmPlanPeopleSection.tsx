"use client";

import type { OnboardingForm } from "@/lib/onboarding/types";

export function ConfirmPlanPeopleSection({
  form,
  onChange,
}: {
  form: OnboardingForm;
  onChange: (patch: Partial<OnboardingForm>) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-mu-label font-semibold text-mu-fg">인원</h3>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          className="mu-focus flex h-11 w-11 items-center justify-center rounded-mu-md border border-mu-line bg-mu-card text-mu-title font-bold text-mu-fg"
          onClick={() => onChange({ people: Math.max(1, form.people - 1) })}
          aria-label="인원 줄이기"
        >
          −
        </button>
        <span className="mu-num min-w-[3rem] text-center text-2xl font-bold text-mu-fg">
          {form.people}
        </span>
        <button
          type="button"
          className="mu-focus flex h-11 w-11 items-center justify-center rounded-mu-md border border-mu-line bg-mu-card text-mu-title font-bold text-mu-fg"
          onClick={() => onChange({ people: Math.min(20, form.people + 1) })}
          aria-label="인원 늘리기"
        >
          +
        </button>
      </div>
    </section>
  );
}
