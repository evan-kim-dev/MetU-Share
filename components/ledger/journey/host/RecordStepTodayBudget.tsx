import type { TodayBudgetView } from "@/lib/ledger/today-budget";
import { formatKRW } from "@/lib/shared/format";
import { cn } from "@/lib/design/tokens";

type Props = {
  todayView: TodayBudgetView;
  tripBudgetKrw: number;
};

export function RecordStepTodayBudget({ todayView, tripBudgetKrw }: Props) {
  const remainingPositive = todayView.remainingKrw >= 0;

  return (
    <section
      className={cn(
        "rounded-mu-xl border px-5 py-5",
        remainingPositive
          ? "border-mu-ok/25 bg-mu-ok-soft"
          : "border-mu-err/25 bg-mu-err-soft"
      )}
      aria-label={`오늘 쓸 수 있는 돈 ${formatKRW(Math.max(0, todayView.remainingKrw))}`}
    >
      <p className="text-mu-caption font-medium text-mu-fg-2">
        오늘 쓸 수 있는 돈
      </p>
      <p className="mu-num mt-1 text-3xl font-bold tracking-tight text-mu-fg">
        {formatKRW(Math.max(0, todayView.remainingKrw))}
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-mu-card/80">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-mu-base",
            remainingPositive ? "bg-mu-ok" : "bg-mu-err"
          )}
          style={{
            width: `${Math.round(Math.min(1, todayView.usedRatio) * 100)}%`,
          }}
        />
      </div>
      <p className="mt-2 text-mu-caption text-mu-fg-3">
        일 예산 {formatKRW(todayView.dayBudgetKrw)} · 오늘{" "}
        {formatKRW(todayView.spentTodayKrw)} 씀
        {tripBudgetKrw <= 0 ? " · 총예산 미설정" : ""}
      </p>
    </section>
  );
}