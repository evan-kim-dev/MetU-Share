const EASTER_CELEB_PREFIX = "metu:easter-celeb:v2:";

function easterCelebKey(destination: string) {
  return `${EASTER_CELEB_PREFIX}${destination.trim().toLowerCase()}`;
}

export function wasEasterCelebrated(destination: string): boolean {
  try {
    return sessionStorage.getItem(easterCelebKey(destination)) === "1";
  } catch {
    return false;
  }
}

export function markEasterCelebrated(destination: string) {
  try {
    sessionStorage.setItem(easterCelebKey(destination), "1");
  } catch {
    // ignore
  }
}
