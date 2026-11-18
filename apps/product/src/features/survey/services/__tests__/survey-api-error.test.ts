import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveServerErrorMessage } from "@/lib/server-error/server-error-message";
import { listSurveys } from "../survey";

const notFoundBody = {
  success: false,
  data: null,
  error: { code: "APP_ERROR", message: "問卷不存在或尚未開放" },
  timestamp: "2026-11-11T14:23:38.038Z",
  meta: { requestId: "req_1794407018028_pr8z3gh7u" },
};

const t = (key: string) => `i18n:${key}`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("survey api errors (#525)", () => {
  it("顯示 server 的錯誤訊息，不露出原始 JSON 與 requestId", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(notFoundBody), { status: 404 }))
    );

    const error = await listSurveys().catch((e: unknown) => e);
    const shown = resolveServerErrorMessage(error, { locale: "zh-TW", t, fallback: "載入失敗" });

    expect(shown).toBe("問卷不存在或尚未開放");
    expect(String((error as Error).message)).not.toMatch(/Survey API|requestId|\{/);
  });

  it("回應不是 JSON 時改用情境訊息", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 502 }))
    );

    const error = await listSurveys().catch((e: unknown) => e);
    const shown = resolveServerErrorMessage(error, { locale: "zh-TW", t, fallback: "載入失敗" });

    expect(shown).not.toMatch(/html|Survey API/);
  });
});
