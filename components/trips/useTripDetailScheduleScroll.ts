"use client";

import { useEffect, type RefObject } from "react";
import { scrollIntoScrollParent } from "@/lib/dom/scroll-into-parent";
import type { DetailTab } from "@/components/trips/trip-detail-content.types";

export function useTripDetailScheduleScroll(
  detailTab: DetailTab,
  scheduleScrollNonce: number,
  scheduleSectionRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    if (detailTab !== "schedule" || scheduleScrollNonce === 0) return;
    let cancelled = false;
    let tries = 0;
    const tick = () => {
      if (cancelled) return;
      const el = scheduleSectionRef.current;
      // 시트 닫힘·일정 마운트 전에 스크롤하면 빈 자리/예산으로 돌아가요
      if (!el || el.getBoundingClientRect().height < 48) {
        tries += 1;
        if (tries < 30) window.setTimeout(tick, 40);
        return;
      }
      scrollIntoScrollParent(el, { offsetPx: 12, behavior: "smooth" });
    };
    // Sheet 포커스 복귀 다음에 실행
    const t = window.setTimeout(tick, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [detailTab, scheduleScrollNonce, scheduleSectionRef]);
}