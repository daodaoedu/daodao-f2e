import { describe, expect, it } from "vitest";
import { type LighthouseAccessCheck, resolveLighthouseNavEntry } from "../lighthouse-nav-entry";

const loading: LighthouseAccessCheck = { state: "loading" };
const loaded = (count: number): LighthouseAccessCheck => ({ state: "loaded", count });
// API 對未登入與非成員都回 APP_ERROR（2026-11-25 dev 實測）
const denied: LighthouseAccessCheck = {
  state: "error",
  error: { success: false, error: { code: "APP_ERROR", message: "尚未開通燈塔組織成員資格" } },
};
const outage: LighthouseAccessCheck = {
  state: "error",
  error: { success: false, error: { code: "SERVICE_UNAVAILABLE" } },
};
const network: LighthouseAccessCheck = { state: "error", error: new TypeError("Failed to fetch") };

describe("resolveLighthouseNavEntry", () => {
  it("links organization members to the lighthouse (AC-1)", () => {
    expect(resolveLighthouseNavEntry(loaded(1), loading)).toBe("/lighthouse");
  });

  it("links leaders without membership to templates (AC-2)", () => {
    expect(resolveLighthouseNavEntry(denied, loaded(2))).toBe("/lighthouse/templates");
    expect(resolveLighthouseNavEntry(loaded(0), loaded(1))).toBe("/lighthouse/templates");
  });

  it("hides the entry from learners (AC-3)", () => {
    expect(resolveLighthouseNavEntry(denied, loaded(0))).toBeNull();
    expect(resolveLighthouseNavEntry(denied, denied)).toBeNull();
  });

  it("hides the entry until the checks settle (AC-4)", () => {
    expect(resolveLighthouseNavEntry(loading, loaded(3))).toBeNull();
    expect(resolveLighthouseNavEntry(denied, loading)).toBeNull();
  });

  it("keeps the entry on transient failures so members are not locked out (AC-4)", () => {
    expect(resolveLighthouseNavEntry(outage, loading)).toBe("/lighthouse");
    expect(resolveLighthouseNavEntry(network, loading)).toBe("/lighthouse");
    expect(resolveLighthouseNavEntry(denied, outage)).toBe("/lighthouse/templates");
  });
});
