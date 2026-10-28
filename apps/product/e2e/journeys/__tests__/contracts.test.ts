import { describe, expect, it } from "vitest";
import {
  createAsyncCache,
  type FixtureManifest,
  fixtureProgram,
  fixtureUser,
  journeyDate,
  readApiData,
  serviceUrl,
} from "../contracts";

const manifest: FixtureManifest = {
  users: [{ key: "learner", email: "fixture@example.test", id: 1 }],
  organization: { id: 1 },
  programs: [{ id: 2, kind: "lighthouse", name: "Fixture" }],
  practice_templates: [],
};
describe("journey fixture contract", () => {
  it("uses only explicitly registered identities", () => {
    expect(fixtureUser(manifest, "learner").id).toBe(1);
    expect(() => fixtureUser(manifest, "owner")).toThrow("Missing fixture user");
  });
  it("requires a registered program kind", () => {
    expect(fixtureProgram(manifest, "lighthouse").id).toBe(2);
    expect(() => fixtureProgram(manifest, "challenge")).toThrow("Missing fixture program");
  });
  it("preserves admin deployment prefixes", () => {
    expect(serviceUrl("https://example.test/admin/", "/group-challenges")).toBe(
      "https://example.test/admin/group-challenges"
    );
  });
});

describe("worker-local authentication cache", () => {
  it("shares a pending request for one identity without mixing roles", async () => {
    const cached = createAsyncCache<string>();
    let calls = 0;
    const load = async () => {
      calls += 1;
      return "fixture-token";
    };
    expect(await Promise.all([cached("owner", load), cached("owner", load)])).toEqual([
      "fixture-token",
      "fixture-token",
    ]);
    expect(calls).toBe(1);
    await cached("learner", load);
    expect(calls).toBe(2);
  });
  it("evicts rejected authentication attempts", async () => {
    const cached = createAsyncCache<string>();
    await expect(
      cached("owner", async () => {
        throw new Error("login failed");
      })
    ).rejects.toThrow("login failed");
    expect(await cached("owner", async () => "recovered")).toBe("recovered");
  });
});

describe("API response handling", () => {
  it("accepts the backend no-content deletion contract", () => {
    expect(readApiData(204, "")).toBeUndefined();
  });
  it("reads successful JSON envelopes", () => {
    expect(readApiData(200, '{"data":{"id":1}}')).toEqual({ id: 1 });
  });
  it("does not hide unexpectedly empty JSON responses", () => {
    expect(() => readApiData(200, "")).toThrow();
  });
});

describe("journey dates use the application calendar", () => {
  it.each([
    ["2026-10-28T19:20:00Z", 0, "2026-10-29"],
    ["2026-10-28T19:20:00Z", 1, "2026-10-30"],
    ["2026-10-31T19:20:00Z", -1, "2026-10-31"],
    ["2026-12-31T19:20:00Z", 1, "2027-01-02"],
    ["2028-02-28T19:20:00Z", 1, "2028-03-01"],
    ["2026-10-28T15:59:59Z", 0, "2026-10-28"],
    ["2026-10-28T16:00:00Z", 0, "2026-10-29"],
  ])("maps %s plus %i days to %s in Taipei", (instant, offset, expected) => {
    expect(journeyDate(offset, new Date(instant))).toBe(expected);
  });
});
