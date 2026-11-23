/** 로그인/콜백으로 다시 보내면 리다이렉트 루프가 나요. (/update-password 는 허용) */
function isAuthLoopPath(pathname: string): boolean {
  if (pathname === "/login" || pathname.startsWith("/login?")) return true;
  if (pathname === "/auth" || pathname.startsWith("/auth/")) return true;
  return false;
}

/** Open-redirect 방지: 내부 상대 경로만 허용 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/"
): string {
  if (!raw) return fallback;
  const value = raw.trim();
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.includes("://")) return fallback;
  if (/[\r\n]/.test(value)) return fallback;

  const pathname = value.split(/[?#]/, 1)[0] ?? value;
  if (isAuthLoopPath(pathname) || isAuthLoopPath(value)) {
    return fallback;
  }
  return value;
}
