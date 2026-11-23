"use client";

import { SelectChip } from "@/components/ds";
import { STYLE_OPTIONS } from "@/components/onboarding/confirm-plan.constants";
import type { OnboardingForm, TravelStyle } from "@/lib/onboarding/types";

export function ConfirmPlanStylesSection({
  form,
  onChange,
}: {
  form: OnboardingForm;
  onChange: (patch: Partial<OnboardingForm>) => void;
}) {
  const toggleStyle = (style: TravelStyle) => {
    const next = form.styles.includes(style)
      ? form.styles.filter((s) => s !== style)
      : [...form.styles, style];
    onChange({ styles: next });
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-mu-label font-semibold text-mu-fg">
        여행 스타일 (복수 선택)
      </h3>
      <div className="flex flex-wrap gap-2">
        {STYLE_OPTIONS.map((opt) => (
          <SelectChip
            key={opt.value}
            label={opt.label}
            selected={form.styles.includes(opt.value)}
            onClick={() => toggleStyle(opt.value)}
          />
        ))}
      </div>
    </section>
  );
}
