import { NextRequest, NextResponse } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const environment = vi.hoisted(() => new Map<string, string>());
vi.mock("@daodao/config", () => ({
  getEnv: (key: string, fallback?: string) => environment.get(key) || fallback,
}));
vi.mock("@daodao/i18n/routing", () => ({ routing: {} }));
vi.mock("@daodao/i18n/middleware", () => ({ default: () => () => NextResponse.next() }));

import middleware from "../middleware";

function request(token = "fixture-session", path = "/en/lighthouse/programs") {
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
      .mockResolvedValue(new Response(JSON.stringify({ data: [{ id: 1 }] }), { status: 200 }));
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
