const STORAGE_KEY = "daodao_tracking_ref";
const MAX_SLUG_LENGTH = 100;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export function captureTrackingRef(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref")?.toLowerCase().trim();
  if (ref && ref.length <= MAX_SLUG_LENGTH && SLUG_PATTERN.test(ref)) {
    localStorage.setItem(STORAGE_KEY, ref);
  }
}

export function getTrackingRef(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function clearTrackingRef(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
