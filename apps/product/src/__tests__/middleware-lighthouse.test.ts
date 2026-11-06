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
