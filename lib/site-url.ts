/** Canonical production origin — never land OAuth on a stale preview deployment. */
const PRODUCTION_SITE_URL = "https://met-u.vercel.app";

export function resolveSiteOrigin(fallbackOrigin?: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  // A localhost value (e.g. copied from .env.local into Vercel) must never win
  // on a deployed site, otherwise OAuth lands on http://localhost:3000.
  if (fromEnv && !(isLocalOrigin(fromEnv) && isDeployedContext(fallbackOrigin))) {
    return fromEnv;
  }

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  if (fallbackOrigin) {
    try {
      const url = new URL(fallbackOrigin);
      // Any *.vercel.app host (including old preview aliases) → canonical prod
      if (
        url.hostname === "met-u.vercel.app" ||
        url.hostname.endsWith("-evan-s.vercel.app") ||
        url.hostname === "met-u-evan-s.vercel.app"
      ) {
        return PRODUCTION_SITE_URL;
      }
      return url.origin;
    } catch {
      /* ignore */
    }
  }

  return PRODUCTION_SITE_URL;
}

function isLocalOrigin(value: string): boolean {
  try {
    const host = new URL(value).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  } catch {
    return false;
  }
}

/** True on Vercel (server) or when the current page is not on localhost (browser). */
function isDeployedContext(fallbackOrigin?: string): boolean {
  if (process.env.VERCEL_ENV) return true;
  if (fallbackOrigin) return !isLocalOrigin(fallbackOrigin);
  return false;
}