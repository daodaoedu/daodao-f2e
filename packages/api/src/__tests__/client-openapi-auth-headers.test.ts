import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@daodao/config", () => ({
  getRequiredEnv: () => "https://web.example",
}));

/**
 * openapi-fetch 以 `fetch(request)` 呼叫。
 * mobile 必須：
 * 1. Bearer 寫進實際送出的 headers
 * 2. POST/DELETE body 不能因 Request 重包而遺失
 */
describe("openapi-fetch mobile Authorization + body", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sends Bearer + JSON body on client.POST (reactions upsert path)", async () => {
    vi.stubGlobal("window", {});
    vi.resetModules();
    const { client, initMobileClient, clearMobileClient } = await import("../client");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      // executeFetch 改為 fetch(url, init) 形式
      const url = typeof input === "string" ? input : (input as Request).url;
      expect(url).toContain("/api/v1/reactions");
      const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : {}));
      expect(headers.get("Authorization")).toBe("Bearer mobile-token");
      expect((init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase()).toBe(
        "POST"
      );

      // body 必須存在（按讚失敗主因之一是 body 被弄丟）
      const body = init?.body;
      expect(body).toBeTruthy();
      let text: string;
      if (typeof body === "string") {
        text = body;
      } else if (body instanceof ArrayBuffer) {
        text = new TextDecoder().decode(body);
      } else if (body instanceof Uint8Array) {
        text = new TextDecoder().decode(body);
      } else {
        text = await new Response(body as BodyInit).text();
      }
      const parsed = JSON.parse(text) as {
        targetType: string;
        targetId: string;
        reactionType: string;
      };
      expect(parsed).toMatchObject({
        targetType: "practice",
        targetId: "abc-uuid",
        reactionType: "useful",
      });

      return new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    initMobileClient({
      baseUrl: "https://mobile.example",
      getToken: async () => "mobile-token",
    });

    await client.POST("/api/v1/reactions", {
      body: {
        targetType: "practice",
        targetId: "abc-uuid",
        reactionType: "useful",
      },
    });

    expect(fetchMock).toHaveBeenCalled();
    clearMobileClient();
  });

  it("sends Bearer + body on client.DELETE (reactions remove)", async () => {
    vi.stubGlobal("window", {});
    vi.resetModules();
    const { client, initMobileClient, clearMobileClient } = await import("../client");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (_input, init) => {
      const headers = new Headers(init?.headers ?? {});
      expect(headers.get("Authorization")).toBe("Bearer mobile-token");
      expect((init?.method ?? "GET").toUpperCase()).toBe("DELETE");
      expect(init?.body).toBeTruthy();
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    initMobileClient({
      baseUrl: "https://mobile.example",
      getToken: async () => "mobile-token",
    });

    await client.DELETE("/api/v1/reactions", {
      body: {
        targetType: "practice",
        targetId: "abc-uuid",
      } as never,
    });

    expect(fetchMock).toHaveBeenCalled();
    clearMobileClient();
  });

  it("sends Bearer + body on client.POST persona answers", async () => {
    vi.stubGlobal("window", {});
    vi.resetModules();
    const { client, initMobileClient, clearMobileClient } = await import("../client");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      expect(url).toContain("https://mobile.example/api/v1/persona/answers");
      const headers = new Headers(init?.headers ?? {});
      expect(headers.get("Authorization")).toBe("Bearer mobile-token");
      expect((init?.method ?? "GET").toUpperCase()).toBe("POST");

      const body = init?.body;
      expect(body).toBeTruthy();
      let text: string;
      if (typeof body === "string") {
        text = body;
      } else if (body instanceof ArrayBuffer) {
        text = new TextDecoder().decode(body);
      } else if (body instanceof Uint8Array) {
        text = new TextDecoder().decode(body);
      } else {
        text = await new Response(body as BodyInit).text();
      }
      expect(JSON.parse(text)).toMatchObject({
        questionId: 1,
        textAnswer: "H",
      });

      return new Response(JSON.stringify({ success: true, data: { id: 1 } }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    });

    initMobileClient({
      baseUrl: "https://mobile.example",
      getToken: async () => "mobile-token",
    });

    const res = await client.POST("/api/v1/persona/answers", {
      body: { questionId: 1, textAnswer: "H" },
    });

    expect(res.error).toBeUndefined();
    expect(fetchMock).toHaveBeenCalled();
    clearMobileClient();
  });

  it("wrapFetch on Request input keeps body and Authorization via url+init", async () => {
    vi.resetModules();
    const { setMobileTokenProvider, unauthorizedHandler, clearMobileTokenProvider } =
      await import("../client");

    setMobileTokenProvider(async () => "baked-token");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      // url string form
      expect(typeof input === "string" || input instanceof URL || input instanceof Request).toBe(
        true
      );
      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined)
      );
      expect(headers.get("Authorization")).toBe("Bearer baked-token");
      if (init) {
        expect(init.body).toBeTruthy();
      }
      return new Response(null, { status: 200 });
    });

    const request = new Request("https://api.example/api/v1/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "practice",
        targetId: "1",
        reactionType: "useful",
      }),
    });

    await unauthorizedHandler.wrapFetch(request);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    clearMobileTokenProvider();
  });
});
