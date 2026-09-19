import { describe, expect, it } from "vitest";
import { apiErrorMessage, resolveCohortApiError } from "../cohort-api-error";

describe("resolveCohortApiError", () => {
  it("maps a 400 detail on a known field to its i18n key", () => {
    const error = {
      success: false,
      error: {
        type: "bad_request",
        message: "驗證失敗",
        details: [
          {
            path: "slug",
            message: "Invalid string: must match pattern /^[a-z0-9]+(?:-[a-z0-9]+)*$/",
          },
        ],
      },
    };
    expect(resolveCohortApiError(error)).toEqual({ type: "i18n", key: "cohort_slug_error" });
  });

  it("shows path and server message for an unmapped 400 detail", () => {
    const error = {
      error: {
        type: "bad_request",
        message: "驗證失敗",
        details: [{ path: "displayName", message: "Too big" }],
      },
    };
    expect(resolveCohortApiError(error)).toEqual({
      type: "message",
      message: "displayName: Too big",
    });
  });

  it("prefers the first mappable detail over the generic 驗證失敗 message", () => {
    const error = {
      error: {
        message: "驗證失敗",
        details: [
          { path: "tagline", message: "Too big" },
          { path: "feeAmount", message: "Too small" },
        ],
      },
    };
    expect(resolveCohortApiError(error)).toEqual({ type: "message", message: "tagline: Too big" });
  });

  it("uses the server message for 409 / 403 style errors without details", () => {
    const error = {
      success: false,
      data: null,
      error: { code: "APP_ERROR", message: "同一系列下不可使用重複 slug" },
    };
    expect(resolveCohortApiError(error)).toEqual({
      type: "message",
      message: "同一系列下不可使用重複 slug",
    });
  });

  it("falls back to a top-level message when there is no nested error object", () => {
    expect(resolveCohortApiError({ message: "Network down" })).toEqual({
      type: "message",
      message: "Network down",
    });
  });

  it("falls back when the error is not an object or has no usable message", () => {
    expect(resolveCohortApiError(null)).toEqual({ type: "fallback" });
    expect(resolveCohortApiError("boom")).toEqual({ type: "fallback" });
    expect(resolveCohortApiError({ error: { message: "   " } })).toEqual({ type: "fallback" });
  });
});

describe("apiErrorMessage", () => {
  it("shows the 400 detail (field + message) instead of the generic 驗證失敗", () => {
    const error = {
      success: false,
      error: {
        type: "bad_request",
        message: "驗證失敗",
        details: [{ path: "tags.0", message: "Too big: expected string to have <=30 characters" }],
      },
    };
    expect(apiErrorMessage(error, "儲存失敗")).toBe(
      "Too big: expected string to have <=30 characters"
    );
  });

  it("shows the server message for 409 / 422 without details", () => {
    const error = { error: { code: "APP_ERROR", message: "模板已封存，請先從封存區恢復再編輯" } };
    expect(apiErrorMessage(error, "儲存失敗")).toBe("模板已封存，請先從封存區恢復再編輯");
  });

  it("falls back to the given text when nothing usable is in the error", () => {
    expect(apiErrorMessage(null, "儲存失敗")).toBe("儲存失敗");
    expect(apiErrorMessage({ error: { message: " " } }, "儲存失敗")).toBe("儲存失敗");
  });
});
