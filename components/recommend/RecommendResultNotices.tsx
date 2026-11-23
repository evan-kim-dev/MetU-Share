"use client";

import { Sparkles } from "lucide-react";
import { AILoadingPanel } from "@/components/ui/AILoadingPanel";

export function RecommendResultNotices({
  enriching,
  enrichNotice,
  routeOptimizeNotice,
  routeOptimizing,
  isEasterEgg,
  easterSummary,
}: {
  enriching: boolean;
  enrichNotice: "fallback" | "error" | null;
  routeOptimizeNotice: boolean;
  routeOptimizing: boolean;
  isEasterEgg: boolean;
  easterSummary: string;
}) {
  return (
    <>
      {enriching ? (
        <AILoadingPanel
          title="AI가 맞춤 일정을 다듬는 중"
          description="웹 지식·예산 RAG로 일정·항공·숙소를 맞추고 있어요"
        />
      ) : null}

      {enrichNotice && !enriching ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-mu-lg border border-mu-warn/30 bg-mu-warn-soft px-3.5 py-2.5 text-mu-body text-mu-warn"
        >
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            {enrichNotice === "error"
              ? "AI 보강에 잠시 실패했어요. 지금은 기본 일정을 보여주고 있어요."
              : "AI 일정을 만들지 못해, 지식 기반 기본 일정으로 보여드려요. 잠시 후 다시 시도해 주세요."}
          </p>
        </div>
      ) : null}

      {routeOptimizeNotice && !routeOptimizing ? (
        <p className="text-mu-caption text-mu-fg-3">
          동선 자동 최적화는 건너뛰었어요. 일정 순서는 그대로예요.
        </p>
      ) : null}

      {isEasterEgg ? (
        <p className="rounded-mu-lg bg-mu-accent-soft px-3 py-2 text-mu-body text-mu-accent-strong">
          {easterSummary}
        </p>
      ) : null}
    </>
  );
}