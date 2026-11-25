/** One lighthouse access check as the sidebar sees it (daodao#568). */
export type LighthouseAccessCheck =
  | { state: "loading" }
  | { state: "loaded"; count: number }
  | { state: "denied" }
  | { state: "unavailable" };

/**
 * Map an access query to a check, mirroring the middleware gate: only 401/403
 * mean "no access"; any other failure — 429/5xx, a malformed body or a network
 * error — is an outage, not a denial.
 */
export function classifyLighthouseAccess(query: {
  data?: { status: number; count: number | null };
  error?: unknown;
}): LighthouseAccessCheck {
  if (query.error) return { state: "unavailable" };
  if (!query.data) return { state: "loading" };
  const { status, count } = query.data;
  if (status === 401 || status === 403) return { state: "denied" };
  if (status >= 200 && status < 300 && count !== null) return { state: "loaded", count };
  return { state: "unavailable" };
}

/**
 * Decide whether the sidebar shows the 燈塔 entry and where it links.
 *
 * Organization members use the whole lighthouse; cohort leaders without
 * membership may only open templates. `null` hides the entry — while checks
 * are pending (no flash) and for learners. Outages keep the entry so the
 * middleware can show its retry page instead of locking members out.
 */
export function resolveLighthouseNavEntry(
  organizations: LighthouseAccessCheck,
  bindings: LighthouseAccessCheck
): string | null {
  if (organizations.state === "loading") return null;
  if (organizations.state === "unavailable") return "/lighthouse";
  if (organizations.state === "loaded" && organizations.count > 0) return "/lighthouse";

  switch (bindings.state) {
    case "loading":
    case "denied":
      return null;
    case "unavailable":
      return "/lighthouse/templates";
    case "loaded":
      return bindings.count > 0 ? "/lighthouse/templates" : null;
  }
}
