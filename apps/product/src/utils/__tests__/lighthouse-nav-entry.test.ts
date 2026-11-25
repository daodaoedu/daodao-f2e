import { describe, expect, it } from "vitest";
import {
  classifyLighthouseAccess,
  type LighthouseAccessCheck,
  resolveLighthouseNavEntry,
} from "../lighthouse-nav-entry";

const loading: LighthouseAccessCheck = { state: "loading" };
const denied: LighthouseAccessCheck = { state: "denied" };
const unavailable: LighthouseAccessCheck = { state: "unavailable" };
const loaded = (count: number): LighthouseAccessCheck => ({ state: "loaded", count });

describe("classifyLighthouseAccess", () => {
  it("treats only 401 and 403 as no access", () => {
    expect(classifyLighthouseAccess({ data: { status: 403, count: null } })).toEqual(denied);
    expect(classifyLighthouseAccess({ data: { status: 401, count: null } })).toEqual(denied);
  });

  // server 對 403、429、500 都回 code APP_ERROR，只能靠狀態碼分辨（daodao#568 spec audit）
  it("treats rate limits, server errors and gateway failures as outages", () => {
    for (const status of [404, 408, 429, 500, 502, 504]) {
      expect(classifyLighthouseAccess({ data: { status, count: null } })).toEqual(unavailable);
    }
  });

  it("treats a 200 without a list as an outage, like the middleware", () => {
    expect(classifyLighthouseAccess({ data: { status: 200, count: null } })).toEqual(unavailable);
  });

  it("treats network failures as outages", () => {
    expect(classifyLighthouseAccess({ error: new TypeError("Failed to fetch") })).toEqual(
      unavailable
    );
  });

  it("reports the list length on success and loading before a response", () => {
    expect(classifyLighthouseAccess({ data: { status: 200, count: 2 } })).toEqual(loaded(2));
    expect(classifyLighthouseAccess({})).toEqual(loading);
  });
});

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

  it("keeps the entry during outages so members are not locked out (AC-4)", () => {
    expect(resolveLighthouseNavEntry(unavailable, loading)).toBe("/lighthouse");
    expect(resolveLighthouseNavEntry(denied, unavailable)).toBe("/lighthouse/templates");
  });
});
