export function TripDetailStyleSection({ styleLabels }: { styleLabels: string[] }) {
  if (styleLabels.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-extrabold text-ink-heading">여행 스타일</h3>
      <div className="flex flex-wrap gap-2">
        {styleLabels.map((label) => (
          <span
            key={label}
            className="rounded-full bg-surface-soft px-3 py-1.5 text-sm font-semibold text-brand-strong"
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}