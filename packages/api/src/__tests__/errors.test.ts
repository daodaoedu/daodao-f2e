import { describe, expect, it } from "vitest";
import { ApiError, apiErrorFromBody, handleApiError, isApiError } from "../errors";

describe("ApiError", () => {
  it("creates an error with status and message", () => {
    const err = new ApiError(400, "Bad request");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(400);
    expect(err.message).toBe("Bad request");
    expect(err.data).toBeUndefined();
  });

  it("creates an error with data", () => {
    const data = { code: "VALIDATION", message: "field required" };
    const err = new ApiError(422, "Validation failed", data);
    expect(err.status).toBe(422);
    expect(err.data).toEqual(data);
  });
});

describe("isApiError", () => {
  it("returns true for ApiError instances", () => {
    expect(isApiError(new ApiError(500, "fail"))).toBe(true);
  });

  it("returns false for plain Error", () => {
    expect(isApiError(new Error("fail"))).toBe(false);
  });

  it("returns false for non-error values", () => {
    expect(isApiError(null)).toBe(false);
    expect(isApiError("string")).toBe(false);
    expect(isApiError(undefined)).toBe(false);
  });
});

describe("apiErrorFromBody", () => {
  it("keeps status, code, message and details from the server body", () => {
    const err = apiErrorFromBody(
      400,
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "請求資料格式錯誤", details: { a: "x" } },
      },
      "送出失敗"
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe("請求資料格式錯誤");
    expect(err.data).toEqual({
      code: "VALIDATION_ERROR",
      message: "請求資料格式錯誤",
      details: { a: "x" },
    });
  });

  it("maps the rate limiter body (error is the code string)", () => {
    const err = apiErrorFromBody(
      429,
      { success: false, message: "請求過於頻繁", error: "RATE_LIMIT_EXCEEDED" },
      "失敗"
    );
    expect(err.status).toBe(429);
    expect(err.data).toMatchObject({ code: "RATE_LIMIT_EXCEEDED" });
  });

  it("uses the fallback message when the body is empty", () => {
    const err = apiErrorFromBody(502, {}, "撤回失敗");
    expect(err.status).toBe(502);
    expect(err.message).toBe("撤回失敗");
    expect(err.data).toBeUndefined();
  });
});

describe("handleApiError", () => {
  it("returns the same ApiError if given one", () => {
    const err = new ApiError(404, "Not found");
    expect(handleApiError(err)).toBe(err);
  });

  it("wraps a plain Error with status 500", () => {
    const result = handleApiError(new Error("oops"));
    expect(result).toBeInstanceOf(ApiError);
    expect(result.status).toBe(500);
    expect(result.message).toBe("oops");
  });

  it("wraps unknown values with status 500 and generic message", () => {
    const result = handleApiError("random string");
    expect(result).toBeInstanceOf(ApiError);
    expect(result.status).toBe(500);
    expect(result.message).toBe("Unknown error");
  });
});
