import { describe, expect, it } from "vitest";
import {
  lighthouseOrganizationHref,
  resolveLighthouseOrganization,
} from "../lighthouse-organization";

const organizations = [
  { id: 2, status: "active" },
  { id: 3, status: "suspended" },
  { id: 4, status: "active" },
];

describe("resolveLighthouseOrganization", () => {
  it("uses the saved account choice instead of the first organization", () => {
    expect(resolveLighthouseOrganization(organizations, null, 4)).toEqual({
      status: "ready",
      organizationId: 4,
    });
  });
  it("never silently replaces an explicit forbidden, suspended or malformed organization", () => {
    for (const value of ["99", "3", "0", "NaN", "2.5", "", "02"]) {
      expect(resolveLighthouseOrganization(organizations, value, 4).status).toBe("unavailable");
    }
  });
  it("defaults only to an active organization when there is no valid saved choice", () => {
    expect(resolveLighthouseOrganization(organizations, null, 3)).toEqual({
      status: "ready",
      organizationId: 2,
    });
    expect(resolveLighthouseOrganization([{ id: 3, status: "suspended" }], null, null).status).toBe(
      "empty"
    );
  });
  it("uses the authorized resource organization over the unrelated query or account choice", () => {
    expect(resolveLighthouseOrganization(organizations, "99", 2, 4)).toEqual({
      status: "ready",
      organizationId: 4,
    });
    expect(resolveLighthouseOrganization(organizations, "2", 2, 99).status).toBe("unavailable");
  });
});

describe("lighthouseOrganizationHref", () => {
  it("preserves existing query and fragment while replacing the organization", () => {
    expect(
      lighthouseOrganizationHref("/lighthouse/programs?edit=64&organizationId=2#cohort-64", 4)
    ).toBe("/lighthouse/programs?edit=64&organizationId=4#cohort-64");
  });
  it("leaves the organization unspecified until the selection is ready", () => {
    expect(lighthouseOrganizationHref("/lighthouse", undefined)).toBe("/lighthouse");
  });
});

import { createLighthousePreferenceWriter } from "../lighthouse-organization";

describe("createLighthousePreferenceWriter", () => {
  it("serializes rapid choices and persists the final choice", async () => {
    let finish: (() => void) | undefined;
    const writes: number[] = [];
    const writer = createLighthousePreferenceWriter(async (id) => {
      writes.push(id);
      if (writes.length === 1)
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
    });
    writer.request(2);
    writer.request(4);
    writer.request(2);
    finish?.();
    await writer.settled();
    expect(writes).toEqual([2]);
    writer.request(4);
    await writer.settled();
    expect(writes).toEqual([2, 4]);
  });
  it("does not send queued writes after the account scope is disposed", async () => {
    let finish: (() => void) | undefined;
    const writes: number[] = [];
    const writer = createLighthousePreferenceWriter(async (id) => {
      writes.push(id);
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
    });
    writer.request(2);
    writer.request(4);
    writer.dispose();
    finish?.();
    await writer.settled();
    expect(writes).toEqual([2]);
  });
  it("allows the same choice to be retried after a failed save", async () => {
    let calls = 0;
    const writer = createLighthousePreferenceWriter(async () => {
      if (++calls === 1) throw new Error("offline");
    });
    writer.request(2);
    await writer.settled();
    writer.request(2);
    await writer.settled();
    expect(calls).toBe(2);
  });
});

import { lighthouseHistoryDelta, lighthouseRouterHref } from "../lighthouse-organization";

describe("browser history destinations", () => {
  it("removes the browser locale prefix exactly once before localized routing", () => {
    expect(lighthouseRouterHref("/en/lighthouse/programs?organizationId=4#cohort-8")).toBe(
      "/lighthouse/programs?organizationId=4#cohort-8"
    );
    expect(lighthouseRouterHref("/zh-TW/lighthouse?organizationId=2#top")).toBe(
      "/lighthouse?organizationId=2#top"
    );
    expect(lighthouseRouterHref("/lighthouse?organizationId=2#top")).toBe(
      "/lighthouse?organizationId=2#top"
    );
    expect(lighthouseRouterHref("/en?x=1#top")).toBe("/?x=1#top");
  });
  it("retains the direction and distance for browser back and forward", () => {
    expect(lighthouseHistoryDelta(5, 4)).toBe(-1);
    expect(lighthouseHistoryDelta(4, 5)).toBe(1);
    expect(lighthouseHistoryDelta(5, 2)).toBe(-3);
    expect(lighthouseHistoryDelta(5, undefined)).toBeNull();
  });
});

import { lighthouseHistoryRestore } from "../lighthouse-organization";

describe("lighthouseHistoryRestore", () => {
  it("never guesses Back or Forward for unmarked or ambiguous entries", () => {
    for (const target of [undefined, null, "6", 5]) {
      expect(lighthouseHistoryRestore(5, target)).toEqual({ kind: "replace" });
    }
  });
  it("preserves the direction of a known Back or Forward entry", () => {
    expect(lighthouseHistoryRestore(5, 3)).toEqual({ kind: "traverse", delta: -2 });
    expect(lighthouseHistoryRestore(5, 6)).toEqual({ kind: "traverse", delta: 1 });
  });
});

import { lighthouseScopedHistoryRestore } from "../lighthouse-organization";

describe("lighthouseScopedHistoryRestore", () => {
  it("never interprets numeric indices from an earlier document or provider mount", () => {
    expect(
      lighthouseScopedHistoryRestore(0, "new-document", { scope: "previous-document", index: 5 })
    ).toEqual({ kind: "replace" });
    expect(lighthouseScopedHistoryRestore(0, "new-document", { index: 1 })).toEqual({
      kind: "replace",
    });
    expect(lighthouseScopedHistoryRestore(0, "new-document", null)).toEqual({ kind: "replace" });
  });
  it("retains signed traversal only inside the same mounted history scope", () => {
    expect(
      lighthouseScopedHistoryRestore(2, "document-a", { scope: "document-a", index: 1 })
    ).toEqual({ kind: "traverse", delta: -1 });
    expect(
      lighthouseScopedHistoryRestore(1, "document-a", { scope: "document-a", index: 2 })
    ).toEqual({ kind: "traverse", delta: 1 });
  });
});

import {
  interceptLighthouseTraversal,
  type LighthouseTraversalEventType,
} from "../lighthouse-organization";

const traversalEvent = (cancelable = true): LighthouseTraversalEventType =>
  Object.assign(new Event("navigate", { cancelable }), {
    navigationType: "traverse",
    destination: {
      url: "https://example.test/en/lighthouse/templates?organizationId=4#saved",
      key: "target-entry",
    },
  });

describe("interceptLighthouseTraversal", () => {
  it("cancels native traversal before the router commits and returns the original destination key", () => {
    const event = traversalEvent();
    expect(interceptLighthouseTraversal(event, { dirty: true, busy: false })).toEqual({
      kind: "confirm",
      href: "/lighthouse/templates?organizationId=4#saved",
      key: "target-entry",
    });
    expect(event.defaultPrevented).toBe(true);
  });
  it("blocks traversal while writing without offering to discard an in-flight write", () => {
    const event = traversalEvent();
    expect(interceptLighthouseTraversal(event, { dirty: true, busy: true })).toEqual({
      kind: "blocked",
    });
    expect(event.defaultPrevented).toBe(true);
  });
  it("allows clean or already-confirmed traversal without intercepting it again", () => {
    for (const allowing of [false, true]) {
      const event = traversalEvent();
      expect(
        interceptLighthouseTraversal(event, { dirty: allowing, busy: false }, allowing)
      ).toBeNull();
      expect(event.defaultPrevented).toBe(false);
    }
  });
  it("leaves noncancelable or nontraversal events to the existing fallback", () => {
    const noncancelable = traversalEvent(false);
    expect(interceptLighthouseTraversal(noncancelable, { dirty: true, busy: false })).toBeNull();
    const push = Object.assign(new Event("navigate", { cancelable: true }), {
      navigationType: "push",
    });
    expect(interceptLighthouseTraversal(push, { dirty: true, busy: false })).toBeNull();
  });
});
