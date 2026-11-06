import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const environment = vi.hoisted(() => new Map<string, string>());
vi.mock("@daodao/config", () => ({
  getEnv: (key: string, fallback?: string) => environment.get(key) || fallback,
}));
vi.mock("@daodao/i18n/middleware", () => ({
  default: () => () => new Response(null, { status: 200 }),
}));
vi.mock("@daodao/i18n/routing", () => ({ routing: {} }));

import middleware from "../../../middleware";

const request = (path: string, token?: string) =>
  new NextRequest(
    `https://app.test${path}`,
    token ? { headers: { cookie: `auth_token=${token}` } } : undefined
  );

afterEach(() => {
  vi.unstubAllGlobals();
  environment.clear();
});

describe("private routes require login and preserve their destination", () => {
  it.each([
    "/spaces",
    "/en/spaces/personal?tab=active",
    "/spaces/challenge",
    "/spaces/123",
  ])("guest %s goes directly to login", async (path) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await middleware(request(path));
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe(path.startsWith("/en/") ? "/en/auth/login" : "/auth/login");
    expect(location.searchParams.get("redirect")).toBe(path);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("expired session goes to login", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    const response = await middleware(request("/en/spaces", "expired"));
    expect(new URL(response.headers.get("location") ?? "").pathname).toBe("/en/auth/login");
  });
  it("valid session enters private spaces", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ data: { user: { id: "user" }, isTemporary: false } }))
        )
    );
    expect((await middleware(request("/en/spaces", "valid"))).status).toBe(200);
  });
  it("service error offers retry and does not ask for login", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    const response = await middleware(request("/en/spaces/personal", "valid"));
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/en/auth/access-unavailable");
    expect(location.searchParams.get("redirect")).toBe("/en/spaces/personal");
  });
  it.each([
    "/spaces/public/token",
    "/en/spaces/public/token",
    "/en/activities",
    "/en/auth/login",
  ])("public %s does not require a session", async (path) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await middleware(request(path))).status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("Lighthouse unauthorized response retains its existing login flow", async () => {
    const response = await middleware(request("/en/lighthouse/organization?organizationId=2"));
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/en/auth/login");
    expect(location.searchParams.get("redirect")).toBe(
      "/en/lighthouse/organization?organizationId=2"
    );
  });
});

describe("private session backend routing", () => {
  it("uses the internal API for an authenticated private page", async () => {
    environment.set("API_INTERNAL_URL", "http://server:4000/");
    environment.set("NEXT_PUBLIC_API_URL", "http://localhost:43140");
    const fetchMock = vi.fn(async (url: string) => {
      if (url === "http://server:4000/api/v1/auth/me")
        return new Response(JSON.stringify({ data: { user: { id: "user" }, isTemporary: false } }));
      throw new TypeError("Public loopback is unreachable inside the product container");
    });
    vi.stubGlobal("fetch", fetchMock);
    const response = await middleware(request("/en/spaces/personal", "valid"));
    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://server:4000/api/v1/auth/me");
  });
  it("falls back to the public API outside a private service network", async () => {
    environment.set("NEXT_PUBLIC_API_URL", "https://api.test/");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ data: { user: { id: "user" } } })));
    vi.stubGlobal("fetch", fetchMock);
    expect((await middleware(request("/en/spaces/personal", "valid"))).status).toBe(200);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.test/api/v1/auth/me");
  });
});
