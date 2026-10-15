import { beforeEach, describe, expect, it, vi } from "vitest";

const mockWrapFetch = vi.fn();
vi.mock("../client", () => ({
  getApiBaseUrl: () => "https://server-dev.daodao.so",
  unauthorizedHandler: { wrapFetch: (...args: unknown[]) => mockWrapFetch(...args) },
}));

import { ApiError } from "../errors";
import { submitBugReport } from "../services/feedback";

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("feedback service — submitBugReport", () => {
  beforeEach(() => mockWrapFetch.mockReset());

  it("POSTs multipart form data to the server API base (daodao#166 J-07: was relative /api/feedback/...)", async () => {
    mockWrapFetch.mockResolvedValue(jsonResponse(201, { success: true, data: { id: 7 } }));
    const screenshot = new File(["png"], "shot.png", { type: "image/png" });

    const result = await submitBugReport({
      area: "ui",
      description: "  設定頁 按鈕 沒反應  ",
      link: "https://app-dev.daodao.so/settings",
      referrer: "https://app-dev.daodao.so/settings/bug-report",
      userAgent: "vitest",
      screenshots: [screenshot],
    });

    expect(result).toEqual({ id: 7 });
    expect(mockWrapFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockWrapFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://server-dev.daodao.so/api/v1/feedback/bug-report");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    const body = init.body as FormData;
    expect(body.get("area")).toBe("ui");
    expect(body.get("description")).toBe("  設定頁 按鈕 沒反應  ");
    expect(body.get("link")).toBe("https://app-dev.daodao.so/settings");
    expect(body.getAll("screenshots")).toHaveLength(1);
  });

  it("omits an empty link", async () => {
    mockWrapFetch.mockResolvedValue(jsonResponse(201, { success: true, data: { id: 8 } }));
    await submitBugReport({ area: "other", description: "x", link: "" });
    const body = (mockWrapFetch.mock.calls[0] as [string, RequestInit])[1].body as FormData;
    expect(body.has("link")).toBe(false);
  });

  it("throws ApiError carrying the server status and message when the server rejects", async () => {
    mockWrapFetch.mockResolvedValue(
      jsonResponse(400, {
        success: false,
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "請求資料格式錯誤",
          details: { link: "Invalid url" },
        },
      })
    );

    const err = await submitBugReport({ area: "ui", description: "x", link: "not a url" }).catch(
      (e) => e
    );

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe("請求資料格式錯誤");
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    mockWrapFetch.mockResolvedValue(new Response("<html>404</html>", { status: 404 }));
    const err = await submitBugReport({ area: "ui", description: "x" }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
  });

  // code review：2xx 代表回報已寫入；body 空或不是 JSON 時不能變成失敗，否則使用者重送會產生重複回報
  it.each([
    ["empty 201", () => new Response(null, { status: 201 })],
    ["non-JSON 201", () => new Response("Created", { status: 201 })],
    ["204", () => new Response(null, { status: 204 })],
  ])("treats a 2xx with an unparsable body as success (%s)", async (_label, makeResponse) => {
    mockWrapFetch.mockResolvedValue(makeResponse());
    await expect(submitBugReport({ area: "ui", description: "x" })).resolves.toEqual({ id: null });
  });
});
