import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildBlogSourceContext,
  clearBlogSourceContext,
  parseBlogSourceContext,
  readBlogSourceHeader,
  recordBlogSourceTouch,
  resolveBlogSourceConfig,
} from "../blog-source-context";

const config = { ttlSeconds: 600, domain: "daodao.test" };
const now = Date.parse("2026-11-13T00:00:00Z");
const touch = {
  articleId: "article-one",
  articleSlug: "article-one",
  locale: "zh-TW" as const,
  source: "search" as const,
  occurredAt: new Date(now).toISOString(),
};
const uuid = "62220e18-ee33-40f3-af1e-aa8081295774";
describe("first-party public Blog context", () => {
  it("requires explicit TTL and first-party deployment domain", () => {
    expect(resolveBlogSourceConfig(undefined, "daodao.test", "app.daodao.test")).toBeNull();
    expect(resolveBlogSourceConfig("600", "daodao.test", "evil.test")).toBeNull();
    expect(resolveBlogSourceConfig("600", ".daodao.test", "app.daodao.test")).toEqual(config);
  });
  it("preserves first touch and records last assist without replacing original search source", () => {
    const first = buildBlogSourceContext(null, touch, config, now, uuid);
    const second = buildBlogSourceContext(
      first,
      {
        ...touch,
        articleId: "article-two",
        articleSlug: "article-two",
        source: "internal",
        occurredAt: new Date(now + 1000).toISOString(),
      },
      config,
      now + 1000,
      "bcbd53c9-9b8b-4892-9ca1-32f4e9c3d608"
    );
    expect(second).toEqual({
      ...first,
      lastAssist: {
        ...touch,
        articleId: "article-two",
        articleSlug: "article-two",
        source: "internal",
        occurredAt: new Date(now + 1000).toISOString(),
      },
    });
  });
  it("rejects expiry, future, wrong config, invalid/extra private fields and malformed context", () => {
    const first = buildBlogSourceContext(null, touch, config, now, uuid);
    expect(parseBlogSourceContext(JSON.stringify(first), config, now + 600000)).toBeNull();
    expect(parseBlogSourceContext(JSON.stringify(first), config, now - 1)).toBeNull();
    expect(
      parseBlogSourceContext(JSON.stringify(first), { ...config, ttlSeconds: 601 }, now)
    ).toBeNull();
    expect(
      parseBlogSourceContext(
        JSON.stringify({ ...first, userId: 123, email: "private@example.invalid" }),
        config,
        now
      )
    ).toBeNull();
    expect(parseBlogSourceContext("not-json", config, now)).toBeNull();
  });
  it("does not renew an expired context or fabricate Direct", () => {
    const first = buildBlogSourceContext(null, touch, config, now, uuid);
    const later = {
      ...touch,
      source: "unknown" as const,
      occurredAt: new Date(now + 600000).toISOString(),
    };
    expect(buildBlogSourceContext(first, later, config, now + 600000, uuid)).toBeNull();
  });
});

afterEach(() => {
  clearBlogSourceContext({ authenticated: false });
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
function browser(state: unknown = false) {
  let cookie = "";
  const writes: string[] = [];
  vi.stubEnv("NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_TTL_SECONDS", "600");
  vi.stubEnv("NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_DOMAIN", "daodao.test");
  vi.stubGlobal("window", {
    location: { hostname: "app.daodao.test", protocol: "https:" },
    posthog: { has_opted_out_capturing: () => state },
  });
  vi.stubGlobal("document", {
    get cookie() {
      return cookie;
    },
    set cookie(value: string) {
      writes.push(value);
      cookie = value.includes("Max-Age=0") ? "" : (value.split(";")[0] ?? "");
    },
  });
  return { writes };
}
it("does not set a context cookie without deployment config or an available tracking preference", () => {
  const { writes } = browser();
  vi.stubEnv("NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_TTL_SECONDS", "");
  recordBlogSourceTouch({ ...touch, occurredAt: new Date().toISOString() });
  expect(writes).toEqual([]);
  expect(readBlogSourceHeader()).toBeUndefined();
  browser(null);
  recordBlogSourceTouch({ ...touch, occurredAt: new Date().toISOString() });
  expect(readBlogSourceHeader()).toBeUndefined();
});
it("returns only public registration context and clears it on explicit logout/success or opt-out", () => {
  browser(false);
  recordBlogSourceTouch({ ...touch, occurredAt: new Date().toISOString() });
  expect(JSON.parse(readBlogSourceHeader() ?? "null")).toMatchObject({
    first: { articleId: "article-one" },
    lastAssist: { articleId: "article-one" },
  });
  clearBlogSourceContext();
  expect(readBlogSourceHeader()).toBeUndefined();
  const { writes } = browser(true);
  recordBlogSourceTouch({ ...touch, occurredAt: new Date().toISOString() });
  expect(readBlogSourceHeader()).toBeUndefined();
  expect(writes.every((value) => value.includes("Max-Age=0"))).toBe(true);
});
it("never throws when browser storage or the tracking preference is blocked", () => {
  browser();
  vi.stubGlobal("document", {
    get cookie() {
      throw new Error("blocked");
    },
    set cookie(_value: string) {
      throw new Error("blocked");
    },
  });
  expect(() =>
    recordBlogSourceTouch({ ...touch, occurredAt: new Date().toISOString() })
  ).not.toThrow();
  expect(readBlogSourceHeader()).toBeUndefined();
  expect(() => clearBlogSourceContext()).not.toThrow();
});

it("does not recreate a source after a confirmed permanent user or successful registration; logout permits a fresh journey", () => {
  browser(false);
  recordBlogSourceTouch({ ...touch, occurredAt: new Date().toISOString() });
  clearBlogSourceContext({ authenticated: true });
  recordBlogSourceTouch({ ...touch, occurredAt: new Date().toISOString() });
  expect(readBlogSourceHeader()).toBeUndefined();
  clearBlogSourceContext({ authenticated: false });
  recordBlogSourceTouch({ ...touch, occurredAt: new Date().toISOString() });
  expect(readBlogSourceHeader()).toBeDefined();
});
