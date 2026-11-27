import { client } from "../client";

export type FeatureFlagsType = Readonly<Record<string, boolean>>;

/** Only explicit server booleans enable features; unknown keys stay disabled. */
export function resolveFeatureFlags(
  data: Readonly<Record<string, unknown>> | undefined,
  unavailable: boolean
): FeatureFlagsType {
  if (unavailable || !data) return {};
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === true]));
}

/** Isolate effective flags by session and the currently selected organization. */
export function getFeatureFlagsQueryKey(session: string | null, organizationId?: number) {
  if (!session) return null;
  if (
    organizationId !== undefined &&
    (!Number.isSafeInteger(organizationId) || organizationId <= 0)
  ) {
    return null;
  }
  return ["feature-flags", session, organizationId ?? null] as const;
}

export const getFeatureFlags = (organizationId?: number) =>
  client.GET("/api/v1/feature-flags", {
    cache: "no-store",
    params: { query: { organizationId: organizationId?.toString() } },
  });

export interface FeatureFlagSelection {
  session: string | null;
  organizationId: number | undefined;
  revision: number;
}

/** A revisited context must obtain a fresh server decision rather than reuse its old snapshot. */
export function advanceFeatureFlagSelection(
  previous: FeatureFlagSelection,
  session: string | null,
  organizationId?: number
): FeatureFlagSelection {
  if (previous.session === session && Object.is(previous.organizationId, organizationId))
    return previous;
  return { session, organizationId, revision: previous.revision + 1 };
}
