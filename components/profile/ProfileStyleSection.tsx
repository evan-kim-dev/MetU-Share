"use client";

import { Sparkles } from "lucide-react";
import type { TravelStyle } from "@/components/onboarding/types";
import { PROFILE_STYLE_OPTIONS } from "@/lib/mock/profile";

interface ProfileStyleSectionProps {
  selectedStyles: TravelStyle[];
  styleInsight: string;
  styleInsightLoading: boolean;
  onToggle: (value: TravelStyle) => void;
}

export function ProfileStyleSection({
  selectedStyles,
  styleInsight,
  styleInsightLoading,
  onToggle,
}: ProfileStyleSectionProps) {
  return (
    <section className="rounded-xl2 bg-mu-card p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-mint-dark">
          <Sparkles className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <h3 className="text-xl font-semibold text-mu-fg">여행 취향 설정</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PROFILE_STYLE_OPTIONS.map((option) => {
          const selected = selectedStyles.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={[
                "flex flex-col items-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold tracking-wide transition-colors",
                selected
                  ? "border-2 border-mu-accent bg-mu-accent-soft text-mu-accent"
                  : "border border-mu-line bg-mu-card text-mu-fg-2",
              ].join(" ")}
            >
              <span className="text-lg">{option.emoji}</span>
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-full border border-insight-border bg-insight-bg px-3 py-2">
        <Sparkles
          className={[
            "mt-0.5 h-4 w-4 shrink-0 text-mu-accent",
            styleInsightLoading ? "animate-pulse" : "",
          ].join(" ")}
        />
        <p className="text-sm leading-5 text-mu-accent">{styleInsight}</p>
      </div>
    </section>
  );
}
