import { ApiError } from "@daodao/api";
import { describe, expect, it } from "vitest";
import { type BugReportErrorMessageKey, resolveBugReportErrorMessage } from "../bug-report-error";

const LABELS: Record<BugReportErrorMessageKey, string> = {
  bug_area_label: "問題區域",
  bug_description_label: "詳細描述",
  bug_link_label: "相關連結（選填）",
  operation_failed_retry: "操作失敗，請稍後再試",
};
const t = (key: BugReportErrorMessageKey) => LABELS[key];

const apiError = (status: number, message: string, details?: Record<string, string>) =>
  new ApiError(status, message, { code: "X", message, ...(details ? { details } : {}) } as never);

describe("resolveBugReportErrorMessage", () => {
  it("400 shows the server message plus the offending field", () => {
    expect(
      resolveBugReportErrorMessage(apiError(400, "請求資料格式錯誤", { link: "Invalid URL" }), t)
    ).toBe("請求資料格式錯誤：相關連結（選填）");
  });

  it("422 shows the server message (no known fields → message only)", () => {
    expect(resolveBugReportErrorMessage(apiError(422, "描述太長", { unknown: "x" }), t)).toBe(
      "描述太長"
    );
  });

  it.each([
    401, 403, 404, 413, 429, 500, 503,
  ])("status %i falls back to the generic i18n message", (status) => {
    expect(
      resolveBugReportErrorMessage(apiError(status, "錯誤回報送出過於頻繁，請稍後再試"), t)
    ).toBe("操作失敗，請稍後再試");
  });

  it("network errors (non-ApiError) fall back to the generic message", () => {
    expect(resolveBugReportErrorMessage(new TypeError("Failed to fetch"), t)).toBe(
      "操作失敗，請稍後再試"
    );
  });
});
