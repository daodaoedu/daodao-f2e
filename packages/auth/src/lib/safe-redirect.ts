const RETURN_ORIGIN = "https://return.invalid";

/** Keep login return paths on this site and avoid authentication redirect loops. */
export function getSafeLoginRedirect(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/";
  try {
    let decoded = value;
    for (let pass = 0; pass < 3; pass += 1) {
      if (
        decoded.startsWith("//") ||
        decoded.includes("\\") ||
        Array.from(decoded).some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
      )
        return "/";
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
    const target = new URL(decoded, RETURN_ORIGIN);
    if (target.origin !== RETURN_ORIGIN) return "/";
    if (
      /^\/(?:en\/|zh-TW\/)?auth\/(?:login|callback|error|access-unavailable)(?:\/|$)/.test(
        target.pathname
      )
    )
      return "/";
    return value;
  } catch {
    return "/";
  }
}
