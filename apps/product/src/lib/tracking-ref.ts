const STORAGE_KEY = "daodao_tracking_ref";
const MAX_SLUG_LENGTH = 100;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export function captureTrackingRef(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref")?.toLowerCase().trim();
    if (ref && ref.length <= MAX_SLUG_LENGTH && SLUG_PATTERN.test(ref)) {
      localStorage.setItem(STORAGE_KEY, ref);
    }
  } catch {
    // localStorage 在無痕模式或隱私設定下可能拋出異常
  }
}

export function getTrackingRef(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearTrackingRef(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
