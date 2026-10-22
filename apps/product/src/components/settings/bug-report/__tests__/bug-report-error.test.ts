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

import type { ServerErrorMessageKey } from "@/lib/server-error/server-error-message";
import { type BugReportErrorOptions, resolveBugReportErrorMessage } from "../bug-report-error";

const CJK = /[㐀-鿿]/;

// 用真的 locale 檔，en 混入中文或漏 key 都會被抓到
const optionsFor = (locale: "en" | "zh-TW"): BugReportErrorOptions => {
  const messages = locale === "en" ? enMessages : zhTWMessages;
  return {
    locale,
    t: (key) => messages.app_product[key],
    tInvalidFields: (fields) => messages.app_product.bug_invalid_fields.replace("{fields}", fields),
    serverT: (key: ServerErrorMessageKey) => messages.common.server_error[key],
  };
};
const en = optionsFor("en");
const zh = optionsFor("zh-TW");

const apiError = (
  status: number,
  code: string,
  message: string,
  details?: Record<string, string>
) => new ApiError(status, message, { code, message, ...(details ? { details } : {}) } as never);

describe("resolveBugReportErrorMessage", () => {
  // daodao#353 regression：/en 上傳 879KB 截圖，server 回 400 FILE_UPLOAD_ERROR「檔案大小超過限制」，
  // toast 原本直接顯示這段中文
  describe("oversized screenshot (400 FILE_UPLOAD_ERROR)", () => {
    const oversized = apiError(400, "FILE_UPLOAD_ERROR", "檔案大小超過限制");

    it("en shows the English screenshot limit, no Chinese", () => {
      const message = resolveBugReportErrorMessage(oversized, en);
      expect(message).toBe(enMessages.app_product.bug_screenshot_limit);
      expect(message).not.toMatch(CJK);
    });

    it("zh-TW shows the Chinese screenshot limit", () => {
      expect(resolveBugReportErrorMessage(oversized, zh)).toBe(
        "截圖僅支援 JPEG、PNG、WebP，每張 500KB 以內，最多 3 張"
      );
    });
  });

  describe("400 VALIDATION_ERROR naming form fields", () => {
    const invalidLink = apiError(400, "VALIDATION_ERROR", "請求資料格式錯誤", {
      link: "Invalid url",
    });

    it("zh-TW shows the message plus the offending field", () => {
      expect(resolveBugReportErrorMessage(invalidLink, zh)).toBe(
        "請求資料格式錯誤：相關連結（選填）"
      );
    });

    it("en shows English message and English field names", () => {
      expect(resolveBugReportErrorMessage(invalidLink, en)).toBe(
        "Please check the format of: Related link (optional)"
      );
    });

    it("joins several fields with the locale separator", () => {
      const error = apiError(400, "VALIDATION_ERROR", "請求資料格式錯誤", {
        area: "x",
        link: "y",
      });
      expect(resolveBugReportErrorMessage(error, en)).toBe(
        "Please check the format of: Problem Area, Related link (optional)"
      );
      expect(resolveBugReportErrorMessage(error, zh)).toBe(
        "請求資料格式錯誤：問題區域、相關連結（選填）"
      );
    });
  });

  describe("422 business error without known fields", () => {
    const tooLong = apiError(422, "APP_ERROR", "描述太長", { unknown: "x" });

    it("zh-TW keeps the server message", () => {
      expect(resolveBugReportErrorMessage(tooLong, zh)).toBe("描述太長");
    });

    it("en falls back to the generic English message", () => {
      expect(resolveBugReportErrorMessage(tooLong, en)).toBe(
        enMessages.app_product.operation_failed_retry
      );
    });
  });

  it.each([
    401, 403, 404, 413, 429, 500, 503,
  ])("status %i falls back to the generic i18n message", (status) => {
    const error = apiError(status, "APP_ERROR", "錯誤回報送出過於頻繁，請稍後再試");
    expect(resolveBugReportErrorMessage(error, zh)).toBe("操作失敗，請稍後再試");
    expect(resolveBugReportErrorMessage(error, en)).toBe(
      enMessages.app_product.operation_failed_retry
    );
  });

  it("network errors (non-ApiError) fall back to the generic message", () => {
    expect(resolveBugReportErrorMessage(new TypeError("Failed to fetch"), zh)).toBe(
      "操作失敗，請稍後再試"
    );
  });
});
