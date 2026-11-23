"use client";

import { SelectChip } from "@/components/ds";
import type { OnboardingForm } from "@/lib/onboarding/types";

export function ConfirmPlanDatesSection({
  form,
  onChange,
}: {
  form: OnboardingForm;
  onChange: (patch: Partial<OnboardingForm>) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-mu-label font-semibold text-mu-fg">일정</h3>
      <div className="flex flex-wrap gap-2">
        <SelectChip
          label="언제든"
          selected={form.dateType === "flexible"}
          onClick={() =>
            onChange({
              dateType: "flexible",
              startDate: "",
              endDate: "",
            })
          }
        />
        <SelectChip
          label="날짜 지정"
          selected={form.dateType === "specific"}
          onClick={() => onChange({ dateType: "specific" })}
        />
      </div>
      {form.dateType === "specific" ? (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-mu-caption text-mu-fg-3">
            출발
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                onChange({
                  startDate: e.target.value,
                  endDate:
                    form.endDate && form.endDate < e.target.value
                      ? ""
                      : form.endDate,
                })
              }
              className="mu-focus min-h-tap rounded-mu-md border border-mu-line bg-mu-card px-3 text-mu-body text-mu-fg"
            />
          </label>
          <label className="flex flex-col gap-1 text-mu-caption text-mu-fg-3">
            귀국
            <input
              type="date"
              value={form.endDate}
              min={form.startDate || undefined}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="mu-focus min-h-tap rounded-mu-md border border-mu-line bg-mu-card px-3 text-mu-body text-mu-fg"
            />
          </label>
        </div>
      ) : (
        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1 text-mu-caption text-mu-fg-3">
            연도
            <input
              type="number"
              value={form.flexibleYear}
              onChange={(e) =>
                onChange({
                  flexibleYear: Number(e.target.value) || form.flexibleYear,
                })
              }
              className="mu-focus min-h-tap rounded-mu-md border border-mu-line bg-mu-card px-3 text-mu-body text-mu-fg"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-mu-caption text-mu-fg-3">
            월
            <input
              type="number"
              min={1}
              max={12}
              value={form.flexibleMonth}
              onChange={(e) =>
                onChange({
                  flexibleMonth: Math.min(
                    12,
                    Math.max(1, Number(e.target.value) || 1)
                  ),
                })
              }
              className="mu-focus min-h-tap rounded-mu-md border border-mu-line bg-mu-card px-3 text-mu-body text-mu-fg"
            />
          </label>
        </div>
      )}
    </section>
  );
}
