import { ApiError } from "@daodao/api";
import enMessages from "@daodao/i18n/locales/en";
import zhTWMessages from "@daodao/i18n/locales/zh-TW";
import { describe, expect, it, vi } from "vitest";

// @daodao/api 會載入 @daodao/config 的 generated/env；CI 的 typecheck 與 test 並行時該檔可能正被重新產生，
// 純邏輯測試不需要 env，比照 packages/api 測試直接 mock
vi.mock("@daodao/config", () => ({
  getEnv: (_key: string, fallback?: string) => fallback,
  getRequiredEnv: () => "https://api.example.com",
}));

import {
  parseServerError,
  resolveServerErrorMessage,
  resolveServerFieldMessage,
  type ServerErrorMessageKey,
  splitApiResult,
} from "../server-error-message";

const CJK = /[㐀-鿿]/;

// 用真的 locale 檔當 t：key 漏翻或 en 混入中文都會在這裡被抓到
const makeT = (messages: typeof enMessages) => (key: ServerErrorMessageKey) => {
  const value = (messages.common.server_error as Record<string, string>)[key];
  if (!value) throw new Error(`missing common.server_error.${key}`);
  return value;
};
const en = { locale: "en", t: makeT(enMessages) } as const;
const zh = { locale: "zh-TW", t: makeT(zhTWMessages) } as const;

const apiError = (
  status: number,
  code: string,
  message: string,
  details?: Record<string, string>
) => new ApiError(status, message, { code, message, ...(details ? { details } : {}) } as never);

// openapi-fetch 的 response.error 是整個 response body
const body = (code: string, message: string) => ({
  success: false,
  data: null,
  error: { code, message },
});

describe("parseServerError", () => {
  it("reads status / code / message / details from ApiError", () => {
    expect(
      parseServerError(
        apiError(400, "VALIDATION_ERROR", "請求資料格式錯誤", { link: "Invalid url" })
      )
    ).toEqual({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "請求資料格式錯誤",
      details: { link: "Invalid url" },
    });
  });

  it("reads the openapi-fetch error body, with status passed separately", () => {
    expect(parseServerError(body("APP_ERROR", "無權限"), 403)).toEqual({
      status: 403,
      code: "APP_ERROR",
      message: "無權限",
      details: undefined,
    });
  });

  it("reads the rate limiter body where `error` is the code string", () => {
    expect(
      parseServerError({ success: false, message: "請求過於頻繁", error: "RATE_LIMIT_EXCEEDED" })
    ).toMatchObject({ code: "RATE_LIMIT_EXCEEDED", message: "請求過於頻繁" });
  });

  it("keeps a plain Error message without a code", () => {
    expect(parseServerError(new Error("上傳失敗"))).toEqual({
      status: undefined,
      code: undefined,
      message: "上傳失敗",
      details: undefined,
    });
  });

  it("returns an empty result for null / strings / numbers", () => {
    expect(parseServerError(null)).toEqual({});
    expect(parseServerError(42)).toEqual({});
  });
});

describe("resolveServerErrorMessage", () => {
  it("known precise code → localized key in both locales", () => {
    const error = apiError(401, "TOKEN_EXPIRED", "認證令牌已過期");
    expect(resolveServerErrorMessage(error, en)).toBe(
      enMessages.common.server_error.session_expired
    );
    expect(resolveServerErrorMessage(error, zh)).toBe(
      zhTWMessages.common.server_error.session_expired
    );
  });

  it("caller code override wins over everything (both locales)", () => {
    const error = apiError(400, "FILE_UPLOAD_ERROR", "檔案大小超過限制");
    const codeMessages = { FILE_UPLOAD_ERROR: "Screenshots must be under 500 KB" };
    expect(resolveServerErrorMessage(error, { ...en, codeMessages })).toBe(
      "Screenshots must be under 500 KB"
    );
    expect(resolveServerErrorMessage(error, { ...zh, codeMessages })).toBe(
      "Screenshots must be under 500 KB"
    );
  });

  describe("detailMessage (first field error from the server)", () => {
    const error = apiError(400, "VALIDATION_ERROR", "請求資料格式錯誤", { title: "標題太長" });

    it("zh-TW shows the detail message", () => {
      expect(resolveServerErrorMessage(error, { ...zh, detailMessage: "標題太長" })).toBe(
        "標題太長"
      );
    });

    it("en ignores it and uses the code key", () => {
      expect(resolveServerErrorMessage(error, { ...en, detailMessage: "標題太長" })).toBe(
        enMessages.common.server_error.validation
      );
    });
  });

  describe("zh-TW passes the server message through for coarse / unknown codes", () => {
    it.each([
      ["APP_ERROR", 409, "此挑戰已額滿"],
      ["INTERNAL_SERVER_ERROR", 500, "不支援的檔案類型。僅支援 JPEG、PNG 和 WebP 格式。"],
      ["SOMETHING_NEW", 400, "新的錯誤"],
    ])("%s", (code, status, message) => {
      expect(resolveServerErrorMessage(apiError(status, code, message), zh)).toBe(message);
    });

    it("plain Error message is kept (current zh behaviour)", () => {
      expect(resolveServerErrorMessage(new Error("發送連結請求失敗"), zh)).toBe("發送連結請求失敗");
    });

    it("no message → caller fallback", () => {
      expect(resolveServerErrorMessage(null, { ...zh, fallback: "儲存失敗" })).toBe("儲存失敗");
    });
  });

  describe("en never shows the Chinese server message", () => {
    it.each([
      [401, "unauthorized"],
      [403, "forbidden"],
      [404, "not_found"],
      [409, "conflict"],
      [410, "gone"],
      [413, "file_too_large"],
      [429, "rate_limited"],
    ] as const)("APP_ERROR %i → status key %s", (status, key) => {
      const message = resolveServerErrorMessage(apiError(status, "APP_ERROR", "中文業務訊息"), en);
      expect(message).toBe(enMessages.common.server_error[key]);
    });

    it("APP_ERROR 400 / 500 → caller fallback (context beats a vague status)", () => {
      expect(
        resolveServerErrorMessage(apiError(400, "APP_ERROR", "中文"), {
          ...en,
          fallback: "Save failed",
        })
      ).toBe("Save failed");
      expect(
        resolveServerErrorMessage(apiError(500, "INTERNAL_SERVER_ERROR", "中文"), {
          ...en,
          fallback: "Save failed",
        })
      ).toBe("Save failed");
    });

    it("unknown code without fallback → generic localized message", () => {
      const message = resolveServerErrorMessage(apiError(400, "BRAND_NEW_CODE", "全新錯誤"), en);
      expect(message).toBe(enMessages.common.server_error.generic);
      expect(message).not.toMatch(CJK);
    });

    it("plain Error / network error → fallback, not its message", () => {
      expect(
        resolveServerErrorMessage(new Error("上傳失敗"), { ...en, fallback: "Upload failed" })
      ).toBe("Upload failed");
      expect(resolveServerErrorMessage(new TypeError("Failed to fetch"), en)).toBe(
        enMessages.common.server_error.generic
      );
    });

    it("openapi-fetch body + status works the same as ApiError", () => {
      expect(resolveServerErrorMessage(body("APP_ERROR", "無權限"), { ...en, status: 403 })).toBe(
        enMessages.common.server_error.forbidden
      );
    });

    it("rate limiter body → rate_limited", () => {
      expect(
        resolveServerErrorMessage({ message: "請求過於頻繁", error: "RATE_LIMIT_EXCEEDED" }, en)
      ).toBe(enMessages.common.server_error.rate_limited);
    });
  });

  it("no en server_error message contains Chinese", () => {
    for (const value of Object.values(enMessages.common.server_error)) {
      expect(value).not.toMatch(CJK);
    }
  });
});

describe("splitApiResult", () => {
  it("takes error and HTTP status from an openapi-fetch result", () => {
    const error = body("APP_ERROR", "無權限");
    const result = { error, response: new Response(null, { status: 403 }) };
    expect(splitApiResult(result)).toEqual({ error, status: 403 });
    // 燈塔 APP_ERROR 403 在 en 要顯示 forbidden，而不是情境 fallback
    const { error: e, status } = splitApiResult(result);
    expect(resolveServerErrorMessage(e, { ...en, status, fallback: "Save failed" })).toBe(
      enMessages.common.server_error.forbidden
    );
  });

  it("passes other values through as the error", () => {
    const error = new Error("網路錯誤");
    expect(splitApiResult(error)).toEqual({ error });
    expect(splitApiResult(null)).toEqual({ error: null });
  });
});

describe("resolveServerFieldMessage", () => {
  it("zh-TW keeps the server field message", () => {
    expect(resolveServerFieldMessage("名稱不可為空", zh)).toBe("名稱不可為空");
  });

  it("en replaces it with the localized invalid-field message", () => {
    expect(resolveServerFieldMessage("名稱不可為空", en)).toBe(
      enMessages.common.server_error.invalid_field
    );
  });

  it("zh-TW without a server message → invalid-field message", () => {
    expect(resolveServerFieldMessage(undefined, zh)).toBe(
      zhTWMessages.common.server_error.invalid_field
    );
  });
});
