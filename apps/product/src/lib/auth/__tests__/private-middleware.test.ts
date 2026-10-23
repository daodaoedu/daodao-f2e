import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@daodao/config", () => ({ getEnv: () => "https://api.test" }));
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

afterEach(() => vi.unstubAllGlobals());

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
