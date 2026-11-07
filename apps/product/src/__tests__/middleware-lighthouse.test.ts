import { NextRequest, NextResponse } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirects = vi.hoisted(() => ({ location: null as string | null }));
const environment = vi.hoisted(() => new Map<string, string>());
vi.mock("@daodao/config", () => ({
  getEnv: (key: string, fallback?: string) => environment.get(key) || fallback,
}));
vi.mock("@daodao/i18n/routing", () => ({ routing: {} }));
vi.mock("@daodao/i18n/middleware", () => ({
  default: () => () =>
    redirects.location ? NextResponse.redirect(redirects.location) : NextResponse.next(),
}));

import middleware from "../middleware";

function request(token = "fixture-session", path = "/en/lighthouse/o/1/programs") {
  return new NextRequest(`https://product.example.test${path}`, {
    headers: token ? { cookie: `auth_token=${token}` } : {},
  });
}

describe("Lighthouse middleware backend routing", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    environment.clear();
    environment.set("NEXT_PUBLIC_API_URL", "https://public-api.example.test/");
    fetchMock
      .mockReset()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: [{ id: 1, status: "active" }] }), { status: 200 })
      );
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("uses the internal API for server-side membership and forwards the session cookie", async () => {
    environment.set("API_INTERNAL_URL", "http://server:4000/");
    const response = await middleware(request());
    expect(fetchMock).toHaveBeenCalledWith("http://server:4000/api/v1/lighthouse/organizations", {
      headers: { Cookie: "auth_token=fixture-session" },
      cache: "no-store",
    });
    expect(response.headers.get("location")).toBeNull();
  });

  it.each([
    ["allowed; auth_token=denied", null],
    ["denied; auth_token=allowed", "/en/lighthouse/access-required"],
  ])("uses the same session as the API with duplicate cookies: %s", async (tokens, destination) => {
    fetchMock.mockImplementation(async (_url: string, options: RequestInit) => {
      const cookie = new Headers(options.headers).get("Cookie");
      const allowed = cookie?.split(";")[0]?.trim() === "auth_token=allowed";
      return new Response(JSON.stringify({ data: allowed ? [{ id: 1, status: "active" }] : [] }), {
        status: allowed ? 200 : 403,
      });
    });
    const response = await middleware(
      request(tokens, "/en/lighthouse/programs/46/cohorts/127/outcome")
    );
    expect(response.headers.get("location")).toBe(
      destination === null ? null : `https://product.example.test${destination}`
    );
  });

  it("keeps the public URL fallback when internal routing is unset", async () => {
    await middleware(request());
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://public-api.example.test/api/v1/lighthouse/organizations"
    );
  });

  it("does not call either API without authentication", async () => {
    const response = await middleware(request(""));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toContain("/en/auth/login?");
  });

  it.each([
    [401, { data: [] }, "/en/auth/login?"],
    [403, { data: [] }, "/en/lighthouse/access-required"],
    [200, { data: [] }, "/en/lighthouse/access-required"],
    [500, { error: "unavailable" }, "/en/lighthouse/access-required?reason=unavailable"],
  ])("preserves membership gate for HTTP %s", async (status, body, destination) => {
    environment.set("API_INTERNAL_URL", "http://server:4000/");
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
    const response = await middleware(request());
    expect(response.headers.get("location")).toContain(destination);
  });
  it.each([
    200, 403,
  ])("allows a non-member leader into templates after organization HTTP %s", async (status) => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                organizationId: 1,
                templateId: 2,
                cohortId: 7,
                cohortName: "場次",
                templateName: "模板",
              },
            ],
          }),
          { status: 200 }
        )
      );
    const response = await middleware(request("fixture-session", "/en/lighthouse/templates"));
    expect(response.headers.get("location")).toBeNull();
    expect(fetchMock.mock.calls[1]?.[0]).toContain("/my-cohort-resource-bindings");
  });
  it.each([
    [200, { data: [] }, "/en/lighthouse/access-required"],
    [401, {}, "/en/auth/login?"],
    [403, {}, "/en/lighthouse/access-required"],
    [500, {}, "/en/lighthouse/access-required?reason=unavailable"],
    [200, { data: null }, "/en/lighthouse/access-required?reason=unavailable"],
    [200, { data: [{}] }, "/en/lighthouse/access-required?reason=unavailable"],
  ])("handles leader bindings HTTP %s without widening access", async (status, body, destination) => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
    const response = await middleware(request("fixture-session", "/en/lighthouse/templates"));
    expect(response.headers.get("location")).toContain(destination);
  });
});

describe("organization invitation URL privacy", () => {
  it.each([
    "/organization-invitation",
    "/en/organization-invitation",
    "/zh-TW/organization-invitation",
  ])("redirects %s before rendering and keeps the secret HttpOnly", async (path) => {
    const response = await middleware(
      new NextRequest(`https://product.example.test${path}?token=${"a".repeat(64)}&other=drop`)
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`https://product.example.test${path}`);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    const cookie = response.cookies.get("organization_invitation");
    expect(cookie).toMatchObject({
      value: "a".repeat(64),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 604800,
    });
  });
  it.each([
    "token=",
    "token=bad%3Bvalue",
    "token=first&token=second",
  ])("rejects ambiguous/malformed invitation %s and clears stale cookie", async (query) => {
    const response = await middleware(
      new NextRequest(`https://product.example.test/organization-invitation?${query}`, {
        headers: { cookie: "organization_invitation=previous" },
      })
    );
    expect(response.status).toBe(303);
    expect(response.cookies.get("organization_invitation")).toMatchObject({ value: "", maxAge: 0 });
  });
  it("keeps local HTTP cookie usable while production HTTPS is secure", async () => {
    const response = await middleware(
      new NextRequest(`http://localhost:3463/organization-invitation?token=${"b".repeat(64)}`)
    );
    expect(response.cookies.get("organization_invitation")?.secure).toBe(false);
  });
  it("does not overwrite the invitation during a reload or locale switch", async () => {
    const response = await middleware(
      new NextRequest("https://product.example.test/en/organization-invitation", {
        headers: { cookie: "organization_invitation=previous" },
      })
    );
    expect(response.cookies.get("organization_invitation")).toBeUndefined();
    expect(response.headers.get("location")).toBeNull();
  });
});

describe("old Lighthouse entry URLs", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    environment.clear();
    environment.set("NEXT_PUBLIC_API_URL", "https://public-api.example.test");
    fetchMock.mockReset().mockImplementation(
      async (url: string) =>
        new Response(
          JSON.stringify({
            data: url.endsWith("/preferences")
              ? { organizationId: 4 }
              : [
                  { id: 2, status: "active" },
                  { id: 3, status: "suspended" },
                  { id: 4, status: "active" },
                ],
          }),
          { status: 200 }
        )
    );
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());
  it("redirects an old section to the account preference, preserving edit query", async () => {
    const response = await middleware(request("fixture-session", "/en/lighthouse/programs?edit=8"));
    expect(response.headers.get("location")).toBe(
      "https://product.example.test/en/lighthouse/o/4/programs?edit=8"
    );
  });
  it("strips the internal listen port from a legacy redirect behind the public host", async () => {
    const response = await middleware(
      new NextRequest("https://product.example.test:3001/en/lighthouse/programs?edit=8", {
        headers: { host: "product.example.test", cookie: "auth_token=fixture-session" },
      })
    );
    expect(response.headers.get("location")).toBe(
      "https://product.example.test/en/lighthouse/o/4/programs?edit=8"
    );
  });
  it("retains the actual local listen port when no reverse proxy is involved", async () => {
    const response = await middleware(
      new NextRequest("http://localhost:3001/en/lighthouse/programs?edit=8", {
        headers: { host: "localhost:3001", cookie: "auth_token=fixture-session" },
      })
    );
    expect(response.headers.get("location")).toBe(
      "http://localhost:3001/en/lighthouse/o/4/programs?edit=8"
    );
  });
  it("honors an authorized organization from old query links before the saved choice", async () => {
    const response = await middleware(
      request("fixture-session", "/lighthouse/templates?organizationId=2&sort=new")
    );
    expect(response.headers.get("location")).toBe(
      "https://product.example.test/lighthouse/o/2/templates?sort=new"
    );
  });
  it("preserves explicitly forbidden or suspended old query choices for the unavailable screen", async () => {
    const response = await middleware(
      request("fixture-session", "/lighthouse/templates?organizationId=3")
    );
    expect(response.headers.get("location")).toBe(
      "https://product.example.test/lighthouse/o/3/templates"
    );
  });
  it("falls back to the first active organization if preferences cannot be read", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith("/preferences")
        ? new Response("unavailable", { status: 503 })
        : new Response(
            JSON.stringify({
              data: [
                { id: 3, status: "suspended" },
                { id: 4, status: "active" },
              ],
            })
          )
    );
    const response = await middleware(request("fixture-session", "/en/lighthouse"));
    expect(response.headers.get("location")).toBe("https://product.example.test/en/lighthouse/o/4");
  });
  it("does not redirect resource links or fetch preferences for them", async () => {
    const response = await middleware(
      request("fixture-session", "/en/lighthouse/programs/2/cohorts/8/focus")
    );
    expect(response.headers.get("location")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("does not silently replace an explicitly empty organization query", async () => {
    const response = await middleware(
      request("fixture-session", "/lighthouse/templates?organizationId=")
    );
    expect(response.headers.get("location")).toBe(
      "https://product.example.test/lighthouse/access-required"
    );
  });
  it("does not redirect an all-suspended membership set into a loop", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: 3, status: "suspended" }] }))
    );
    const response = await middleware(request("fixture-session", "/lighthouse"));
    expect(response.headers.get("location")).toBeNull();
  });
});

describe("redirects through a mapped production listen port", () => {
  beforeEach(() => {
    environment.clear();
    environment.set("API_INTERNAL_URL", "http://server:4000");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (url: string) =>
          new Response(
            JSON.stringify({
              data: url.endsWith("/preferences")
                ? { organizationId: 4 }
                : [{ id: 4, status: "active" }],
            })
          )
      )
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ["http://0.0.0.0:3001", "localhost:43141", "http://localhost:43141"],
    ["https://0.0.0.0:3001", "app.example.test", "https://app.example.test"],
    ["http://localhost:3001", "localhost:3001", "http://localhost:3001"],
    ["http://[::1]:3001", "[::1]:43141", "http://[::1]:43141"],
  ])("preserves the public authority %s -> %s", async (internalOrigin, host, publicOrigin) => {
    const response = await middleware(
      new NextRequest(`${internalOrigin}/en/lighthouse/programs?edit=8`, {
        headers: { host, cookie: "auth_token=session", "x-forwarded-host": "attacker.example" },
      })
    );
    expect(response.headers.get("location")).toBe(
      `${publicOrigin}/en/lighthouse/o/4/programs?edit=8`
    );
  });

  it.each([
    [
      "http://0.0.0.0:3001",
      "app.example.test",
      "https://app.example.test",
      "https://app.example.test",
    ],
    [
      "http://0.0.0.0:3001",
      "app.example.test",
      "https://other.example.test",
      "http://app.example.test",
    ],
    ["http://0.0.0.0:3001", "app.example.test", "not a URL", "http://app.example.test"],
    [
      "http://0.0.0.0:3001",
      "app.example.test",
      "ftp://app.example.test",
      "http://app.example.test",
    ],
    [
      "http://0.0.0.0:3001",
      "localhost:43141",
      "https://app.example.test",
      "http://localhost:43141",
    ],
    [
      "https://0.0.0.0:3001",
      "app.example.test",
      "http://app.example.test",
      "https://app.example.test",
    ],
    [
      "http://0.0.0.0:3001",
      "app.example.test:8443",
      "https://app.example.test:8443",
      "https://app.example.test:8443",
    ],
    [
      "http://0.0.0.0:3001",
      "app.example.test:8443",
      "https://app.example.test",
      "http://app.example.test:8443",
    ],
  ])("uses the configured public HTTPS origin only for the same authority (%s, %s, %s)", async (internalOrigin, host, configuredOrigin, publicOrigin) => {
    environment.set("NEXT_PUBLIC_APP_URL", configuredOrigin);
    const response = await middleware(
      new NextRequest(`${internalOrigin}/en/spaces/personal?tab=active`, {
        headers: { host, "x-forwarded-proto": "https", "x-forwarded-host": "attacker.example" },
      })
    );
    expect(response.headers.get("location")).toBe(
      `${publicOrigin}/en/auth/login?redirect=%2Fen%2Fspaces%2Fpersonal%3Ftab%3Dactive`
    );
  });

  it.each([
    ["", "/en/lighthouse/programs", "/en/auth/login?redirect=%2Fen%2Flighthouse%2Fprograms"],
    ["session", "/en/lighthouse/programs?edit=8", "/en/lighthouse/o/4/programs?edit=8"],
  ])("keeps Lighthouse HTTPS redirects behind TLS termination (%s, %s)", async (token, path, destination) => {
    environment.set("NEXT_PUBLIC_APP_URL", "https://app.example.test");
    const response = await middleware(
      new NextRequest(`http://0.0.0.0:3001${path}`, {
        headers: { host: "app.example.test", ...(token ? { cookie: `auth_token=${token}` } : {}) },
      })
    );
    expect(response.headers.get("location")).toBe(`https://app.example.test${destination}`);
  });

  it.each([
    [
      "/en/spaces/personal?tab=active",
      "/en/auth/login?redirect=%2Fen%2Fspaces%2Fpersonal%3Ftab%3Dactive",
    ],
    ["/en/lighthouse/programs", "/en/auth/login?redirect=%2Fen%2Flighthouse%2Fprograms"],
  ])("keeps guest redirects on the public origin for %s", async (path, destination) => {
    const response = await middleware(
      new NextRequest(`http://0.0.0.0:3001${path}`, {
        headers: { host: "localhost:43141" },
      })
    );
    expect(response.headers.get("location")).toBe(`http://localhost:43141${destination}`);
  });
});

describe("redirect authority safety", () => {
  afterEach(() => {
    redirects.location = null;
  });
  it("leaves an external redirect untouched", async () => {
    redirects.location = "https://accounts.example.test/sign-in";
    const response = await middleware(
      new NextRequest("http://0.0.0.0:3001/challenges", { headers: { host: "localhost:43141" } })
    );
    expect(response.headers.get("location")).toBe("https://accounts.example.test/sign-in");
  });
  it.each([
    "attacker.example/path",
    "user@attacker.example",
    "app.test,attacker.example",
    "attacker.example#fragment",
  ])("rejects malformed authority %s", async (host) => {
    const response = await middleware(
      new NextRequest("http://0.0.0.0:3001/en/spaces/personal", { headers: { host } })
    );
    expect(new URL(response.headers.get("location")!).origin).toBe("http://0.0.0.0:3001");
  });
});

describe("locale redirects behind the public host and internal listen port", () => {
  beforeEach(() => {
    environment.clear();
    redirects.location = null;
  });
  afterEach(() => {
    redirects.location = null;
  });

  it.each([
    [
      "http://0.0.0.0:3001",
      "app-dev.daodao.so",
      "https://app-dev.daodao.so",
      "http://app-dev.daodao.so:3001",
      "https://app-dev.daodao.so",
    ],
    [
      "http://0.0.0.0:3001",
      "localhost:43141",
      "",
      "http://localhost:3001",
      "http://localhost:43141",
    ],
    [
      "http://0.0.0.0:3001",
      "app.example.test:8443",
      "https://app.example.test:8443",
      "http://app.example.test:3001",
      "https://app.example.test:8443",
    ],
    [
      "https://0.0.0.0:3001",
      "app.example.test",
      "https://app.example.test",
      "https://app.example.test:3001",
      "https://app.example.test",
    ],
  ])("normalizes the i18n listen-port authority (%s, %s)", async (internalOrigin, host, configuredOrigin, redirectOrigin, publicOrigin) => {
    environment.set("NEXT_PUBLIC_APP_URL", configuredOrigin);
    redirects.location = `${redirectOrigin}/lighthouse/o/18/templates?sort=new#library`;
    const response = await middleware(
      new NextRequest(`${internalOrigin}/zh-TW/lighthouse/o/18/templates?sort=new`, {
        headers: {
          host,
          cookie: "auth_token=session",
          "x-forwarded-host": "attacker.example",
          "x-forwarded-proto": "https",
        },
      })
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `${publicOrigin}/lighthouse/o/18/templates?sort=new#library`
    );
  });

  it.each([
    "http://foreign.example:3001/lighthouse/o/18/templates",
    "http://app-dev.daodao.so:3002/lighthouse/o/18/templates",
    "https://app-dev.daodao.so:3001/lighthouse/o/18/templates",
    "http://attacker.example:3001/lighthouse/o/18/templates",
    "http://user@app-dev.daodao.so:3001/lighthouse/o/18/templates",
  ])("leaves unrelated or credential-bearing locale redirect untouched: %s", async (location) => {
    environment.set("NEXT_PUBLIC_APP_URL", "https://app-dev.daodao.so");
    redirects.location = location;
    const response = await middleware(
      new NextRequest("http://0.0.0.0:3001/zh-TW/lighthouse/o/18/templates", {
        headers: {
          host: "app-dev.daodao.so",
          cookie: "auth_token=session",
          "x-forwarded-host": "attacker.example",
        },
      })
    );
    expect(response.headers.get("location")).toBe(location);
  });
});
