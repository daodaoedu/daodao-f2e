import { isRecoverableLighthouseQueryError } from "./lighthouse-organization";

/** One lighthouse access check as the sidebar sees it (daodao#568). */
export type LighthouseAccessCheck =
  | { state: "loading" }
  | { state: "loaded"; count: number }
  | { state: "error"; error: unknown };

/**
 * Decide whether the sidebar shows the 燈塔 entry and where it links.
 *
 * Mirrors the middleware gate: organization members use the whole lighthouse,
 * cohort leaders without membership may only open templates. `null` hides the
 * entry — while checks are pending (no flash) and for learners. Transient
 * failures keep the entry so the middleware can show its retry page instead of
 * locking members out.
 */
export function resolveLighthouseNavEntry(
  organizations: LighthouseAccessCheck,
  bindings: LighthouseAccessCheck
): string | null {
  if (organizations.state === "loading") return null;
  if (organizations.state === "loaded" && organizations.count > 0) return "/lighthouse";
  if (organizations.state === "error" && isRecoverableLighthouseQueryError(organizations.error))
    return "/lighthouse";

  if (bindings.state === "loading") return null;
  if (bindings.state === "loaded") return bindings.count > 0 ? "/lighthouse/templates" : null;
  return isRecoverableLighthouseQueryError(bindings.error) ? "/lighthouse/templates" : null;
}
