"use client";

import { SelectChip } from "@/components/ds";
import { DEST_PRESETS } from "@/components/onboarding/confirm-plan.constants";
import type { OnboardingForm } from "@/lib/onboarding/types";

export function ConfirmPlanDestinationSection({
  form,
  onChange,
}: {
  form: OnboardingForm;
  onChange: (patch: Partial<OnboardingForm>) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-mu-label font-semibold text-mu-fg">목적지</h3>
      <div className="flex flex-wrap gap-2">
        {DEST_PRESETS.map((d) => (
          <SelectChip
            key={d}
            label={d}
            selected={form.destination === d}
            onClick={() => {
              onChange({ destination: d, origin: form.origin || "서울" });
            }}
          />
        ))}
      </div>
      <input
        type="text"
        value={form.destination}
        onChange={(e) =>
          onChange({
            destination: e.target.value,
            origin: form.origin || "서울",
          })
        }
        placeholder="직접 입력"
        className="mu-focus min-h-tap w-full rounded-mu-lg border border-mu-line bg-mu-card px-4 text-mu-body text-mu-fg placeholder:text-mu-fg-3"
      />
    </section>
  );
}
