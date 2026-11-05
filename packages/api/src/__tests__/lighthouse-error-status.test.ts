import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@daodao/config", () => ({ getRequiredEnv: () => "https://web.example" }));

describe("Lighthouse query error status", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    502, 503, 408, 429,
  ])("retains HTTP %s when the gateway error is plain text", async (status) => {
    vi.resetModules();
    const { client } = await import("../client");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream offline", { status }));
    const result = await client.GET("/api/v1/lighthouse/organizations");
    expect(result.error).toMatchObject({ status });
  });

  it("retains a forbidden response code and HTTP status", async () => {
    vi.resetModules();
    const { client } = await import("../client");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ success: false, data: null, error: { code: "FORBIDDEN" } }, { status: 403 })
    );
    const result = await client.GET("/api/v1/lighthouse/organizations");
    expect(result.error).toMatchObject({ status: 403, error: { code: "FORBIDDEN" } });
  });

  it("preserves successful Lighthouse response data", async () => {
    vi.resetModules();
    const { client } = await import("../client");
    const data = { success: true, data: [{ id: 2, name: "B" }] };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(data));
    const result = await client.GET("/api/v1/lighthouse/organizations");
    expect(result.data).toEqual(data);
  });

  it("leaves a bodyless not-modified response intact", async () => {
    vi.resetModules();
    const { client } = await import("../client");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 304 }));
    const result = await client.GET("/api/v1/lighthouse/organizations");
    expect(result.response.status).toBe(304);
    expect(result.response.headers.get("Content-Type")).toBeNull();
  });
  it("leaves errors outside Lighthouse unchanged", async () => {
    vi.resetModules();
    const { client } = await import("../client");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("upstream offline", { status: 503 })
    );
    const result = await client.GET("/api/v1/activities");
    expect(result.error).toBe("upstream offline");
  });
});

describe("empty Lighthouse gateway errors", () => {
  afterEach(() => vi.restoreAllMocks());
  it("keeps an empty 503 response as an error, not missing data", async () => {
    vi.resetModules();
    const { client } = await import("../client");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 503,
        headers: { "Content-Length": "0" },
      })
    );
    const result = await client.GET("/api/v1/lighthouse/organizations");
    expect(result.error).toMatchObject({ status: 503 });
    expect(result.data).toBeUndefined();
  });
});
