"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { formatKRW } from "@/lib/shared/format";
import type { BudgetAllocation } from "@/lib/ai/types";

interface BudgetDonutChartProps {
  items: BudgetAllocation[];
  totalBudget: number;
  people: number;
}

/** 레이어 수 — 많을수록 두께감↑ */
const DEPTH_LAYERS = 12;

/**
 * CSS 3D + 글라스모피즘 도넛.
 * WebGL 없이 conic-gradient 원판을 기울이고 Z 레이어로 두께를 만들어요.
 * 중앙 숫자는 가독성을 위해 2D 오버레이로 올려요.
 */
export function BudgetDonutChart({
  items,
  totalBudget,
  people,
}: BudgetDonutChartProps) {
  let cursor = 0;
  const stops = items
    .map((item) => {
      const start = cursor;
      cursor += item.percent;
      return `${item.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  const gradient =
    stops.length > 0
      ? `conic-gradient(from -90deg, ${stops})`
      : "conic-gradient(var(--mu-line) 0% 100%)";

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="relative flex h-48 w-full items-center justify-center"
        style={{ perspective: "720px" }}
        data-testid="budget-donut-3d"
      >
        {/* 바닥 소프트 그림자 */}
        <div
          className="pointer-events-none absolute bottom-2 h-7 w-40 rounded-[100%] bg-mu-fg/12 blur-md"
          aria-hidden
        />

        <div
          className="relative h-40 w-40 [transform:rotateX(58deg)_rotateZ(-8deg)] [transform-style:preserve-3d] motion-reduce:[transform:none]"
          aria-hidden
        >
          {/* 측면 두께 (어두운 복제 레이어) — reduced-motion 에선 숨김 */}
          {Array.from({ length: DEPTH_LAYERS }, (_, i) => {
            const depth = i + 1;
            return (
              <div
                key={depth}
                className="absolute inset-0 rounded-full motion-reduce:hidden"
                style={{
                  background: gradient,
                  transform: `translateZ(${-depth}px)`,
                  filter: `brightness(${0.7 - depth * 0.018}) saturate(0.9)`,
                }}
              />
            );
          })}

          {/* 윗면 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: gradient,
              transform: "translateZ(1px)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.4), 0 10px 28px rgba(25,31,40,0.14)",
            }}
          />
          {/* 글라스 하이라이트 */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              transform: "translateZ(2px)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.1) 36%, transparent 58%)",
            }}
          />
          {/* 도넛 구멍 (글라스 디스크) */}
          <div
            className="absolute inset-[23%] rounded-full border border-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
            style={{
              transform: "translateZ(3px)",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(247,248,250,0.62) 100%)",
              backdropFilter: "blur(8px)",
            }}
          />
        </div>

        {/* 중앙 라벨 — 화면 평면(가독성) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-[4.75rem] w-[4.75rem] flex-col items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white/55 px-1.5 text-center shadow-soft backdrop-blur-md">
            <p className="text-mu-caption font-semibold leading-none text-mu-fg-3">
              총 예산
            </p>
            <p className="mu-num mt-1 max-w-full truncate text-mu-label font-extrabold leading-tight tracking-tight text-mu-fg">
              <AnimatedNumber value={totalBudget} duration={900} />
            </p>
            <p className="mt-0.5 text-mu-caption font-medium leading-none text-mu-fg-3">
              {people}인
            </p>
          </div>
        </div>
      </div>

      <ul className="flex w-full flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between text-mu-body"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/60"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate font-medium text-mu-fg-2">
                {item.label}
              </span>
              <span className="text-mu-caption font-semibold text-mu-fg-3">
                {item.percent}%
              </span>
            </div>
            <span className="mu-num shrink-0 font-bold text-mu-fg">
              {formatKRW(item.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
