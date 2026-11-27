import { describe, expect, it } from "vitest";
import {
  advanceFeatureFlagSelection,
  getFeatureFlagsQueryKey,
  resolveFeatureFlags,
} from "../feature-flags";

describe("effective feature discovery", () => {
  it("accepts newly registered feature keys without a client registry", () => {
    const flags = resolveFeatureFlags({ newOrganizationTool: true, homeTimeline: false }, false);
    expect(flags.newOrganizationTool).toBe(true);
    expect(flags.homeTimeline).toBe(false);
    expect(flags.unregisteredFeature === true).toBe(false);
  });

  it("closes all discovery while loading or after a failed refresh even with stale true", () => {
    expect(resolveFeatureFlags(undefined, false)).toEqual({});
    expect(resolveFeatureFlags({ newOrganizationTool: true }, true)).toEqual({});
  });

  it("requires explicit server booleans and keeps feature decisions independent", () => {
    expect(resolveFeatureFlags({ first: true, second: false, invalid: "true" }, false)).toEqual({
      first: true,
      second: false,
      invalid: false,
    });
  });

  it("isolates selected organization, no organization and authentication sessions", () => {
    const first = getFeatureFlagsQueryKey("session-1:user-A", 9);
    expect(first).not.toEqual(getFeatureFlagsQueryKey("session-1:user-A", 10));
    expect(first).not.toEqual(getFeatureFlagsQueryKey("session-1:user-A"));
    expect(first).not.toEqual(getFeatureFlagsQueryKey("session-2:user-B", 9));
    expect(first).not.toEqual(getFeatureFlagsQueryKey("session-3:user-A", 9));
    expect(getFeatureFlagsQueryKey(null, 9)).toBeNull();
  });

  it("never reuses a previously enabled organization snapshot after switching away and back", () => {
    const initial = { session: "user-A:session-1", organizationId: 9, revision: 0 };
    const otherOrg = advanceFeatureFlagSelection(initial, initial.session, 10);
    const revisit = advanceFeatureFlagSelection(otherOrg, initial.session, 9);
    expect(revisit.revision).toBeGreaterThan(initial.revision);
    expect(advanceFeatureFlagSelection(revisit, revisit.session, 9)).toBe(revisit);
    expect(advanceFeatureFlagSelection(revisit, "user-B:session-2", 9).revision).toBeGreaterThan(
      revisit.revision
    );
  });

  it("keeps an invalid NaN selection stable while its request remains disabled", () => {
    const invalid = { session: "session", organizationId: Number.NaN, revision: 0 };
    expect(advanceFeatureFlagSelection(invalid, "session", Number.NaN)).toBe(invalid);
  });

  it.each([0, -1, 1.5, Number.NaN])("rejects invalid organization context %s", (organizationId) => {
    expect(getFeatureFlagsQueryKey("session", organizationId)).toBeNull();
  });
});
