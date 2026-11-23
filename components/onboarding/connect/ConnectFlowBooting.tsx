export function ConnectFlowBooting() {
  return (
    <div className="space-y-3 p-1" aria-busy="true">
      <p className="text-sm text-mu-fg-2">기기를 확인하는 중…</p>
      <div className="h-4 animate-pulse rounded bg-mu-sunken" />
      <div className="h-4 animate-pulse rounded bg-mu-sunken" />
      <div className="h-4 animate-pulse rounded bg-mu-sunken" />
    </div>
  );
}