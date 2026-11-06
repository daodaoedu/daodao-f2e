import { DEFAULT_REDIRECT_URL } from "./auth-constants";

const RETURN_ORIGIN = "https://return.invalid";

/** Accept only site-relative login destinations, preserving the original query and fragment. */
export function getSafeLoginRedirect(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return DEFAULT_REDIRECT_URL;
  const hasUnsafeCharacters = (path: string) =>
    path.includes("\\") ||
    Array.from(path).some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127);
  if (hasUnsafeCharacters(value)) return DEFAULT_REDIRECT_URL;

  try {
    if (new URL(value, RETURN_ORIGIN).origin !== RETURN_ORIGIN) return DEFAULT_REDIRECT_URL;
    // Encoded query values are data, not a navigation authority. Inspect only the path.
    const suffixStart = value.search(/[?#]/);
    let decodedPath = suffixStart < 0 ? value : value.slice(0, suffixStart);
    for (let pass = 0; pass <= 3; pass += 1) {
      if (decodedPath.startsWith("//") || hasUnsafeCharacters(decodedPath)) {
        return DEFAULT_REDIRECT_URL;
      }
      if (new URL(decodedPath, RETURN_ORIGIN).origin !== RETURN_ORIGIN) return DEFAULT_REDIRECT_URL;
      if (pass === 3) break;
      let next: string;
      try {
        next = decodeURIComponent(decodedPath);
      } catch {
        // A literal percent sign is valid in a relative path and cannot change its origin.
        break;
      }
      if (next === decodedPath) break;
      decodedPath = next;
    }
    const target = new URL(decodedPath, RETURN_ORIGIN);
    if (
      /^\/(?:en\/|zh-TW\/)?auth\/(?:login|callback|error|access-unavailable)(?:\/|$)/.test(
        target.pathname
      )
    ) {
      return DEFAULT_REDIRECT_URL;
    }
    return value;
  } catch {
    return DEFAULT_REDIRECT_URL;
  }
}
