import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@daodao/config", () => ({
  getRequiredEnv: () => "https://web.example",
}));

const importClient = async () => {
  vi.resetModules();
  return import("../client");
};

const getRequestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

describe("client mobile auth bridge", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    { requestCache: "no-store", initCache: undefined, expected: "no-store" },
    { requestCache: "reload", initCache: "no-cache", expected: "no-cache" },
    { requestCache: "no-store", initCache: "default", expected: undefined },
    { requestCache: "default", initCache: undefined, expected: undefined },
  ] as const)("preserves explicit cache precedence: $requestCache / $initCache", async ({
    requestCache,
    initCache,
    expected,
  }) => {
    const { unauthorizedHandler } = await importClient();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null));

    await unauthorizedHandler.wrapFetch(
      new Request("https://web.example/api/v1/auth/me", { cache: requestCache }),
      initCache === undefined ? undefined : { cache: initCache }
    );

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.cache).toBe(expected);
    if (expected === undefined) expect(init).not.toHaveProperty("cache");
    expect(init?.credentials).toBe("include");
  });

  it("keeps cookie credentials for web requests", async () => {
    const { clearMobileTokenProvider, unauthorizedHandler } = await importClient();
    clearMobileTokenProvider();

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await unauthorizedHandler.wrapFetch("https://web.example/api/v1/auth/me", {
      headers: { "X-Test": "1" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
    });
  });

  it("preserves no-store through mobile URL rewriting and a refreshed-token retry", async () => {
    const { client, initMobileClient, clearMobileClient, unauthorizedHandler } =
      await importClient();
    let token = "old-token";
    initMobileClient({
      baseUrl: "https://mobile.example:8443",
      getToken: async () => token,
    });
    unauthorizedHandler.setHandler(async () => {
      token = "new-token";
      return true;
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));

    try {
      await client.GET("/api/v1/auth/me", { cache: "no-store" });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      for (const [index, [url, init]] of fetchMock.mock.calls.entries()) {
        expect(url).toBe("https://mobile.example:8443/api/v1/auth/me");
        expect(init?.cache).toBe("no-store");
        expect(init).not.toHaveProperty("credentials");
        expect(init).not.toHaveProperty("body");
        expect(new Headers(init?.headers).get("Authorization")).toBe(
          index === 0 ? "Bearer old-token" : "Bearer new-token"
        );
      }
    } finally {
      unauthorizedHandler.clearHandler();
      clearMobileClient();
    }
  });

  it("uses bearer token without cookie credentials for mobile requests", async () => {
    const { setMobileTokenProvider, unauthorizedHandler } = await importClient();
    setMobileTokenProvider(async () => "access-token");

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await unauthorizedHandler.wrapFetch("https://api.example/api/v1/auth/me");

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.credentials).toBeUndefined();
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer access-token");
  });

  it("retries 401 responses with the refreshed mobile token", async () => {
    const { setMobileTokenProvider, unauthorizedHandler } = await importClient();
    let token = "old-token";

    setMobileTokenProvider(async () => token);
    unauthorizedHandler.setHandler(async () => {
      token = "new-token";
      return true;
    });

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    await unauthorizedHandler.wrapFetch("https://api.example/api/v1/users/me");

    const firstInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const retryInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(new Headers(firstInit.headers).get("Authorization")).toBe("Bearer old-token");
    expect(new Headers(retryInit.headers).get("Authorization")).toBe("Bearer new-token");
  });

  it("overrides the generated web base URL for mobile client calls", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { client, clearMobileClient, initMobileClient } = await importClient();

    initMobileClient({
      baseUrl: "https://mobile.example:8443",
      getToken: async () => "access-token",
    });

    await client.GET("/api/v1/auth/me");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getRequestUrl(fetchMock.mock.calls[0]?.[0] as RequestInfo | URL)).toBe(
      "https://mobile.example:8443/api/v1/auth/me"
    );

    clearMobileClient();
  });

  it("exposes the mobile base URL for raw-fetch services", async () => {
    const { clearMobileClient, getApiBaseUrl, initMobileClient } = await importClient();

    expect(getApiBaseUrl()).toBe("https://web.example");

    initMobileClient({
      baseUrl: "https://mobile.example:8443/",
      getToken: async () => "access-token",
    });

    expect(getApiBaseUrl()).toBe("https://mobile.example:8443");

    clearMobileClient();
    expect(getApiBaseUrl()).toBe("https://web.example");
  });
});
