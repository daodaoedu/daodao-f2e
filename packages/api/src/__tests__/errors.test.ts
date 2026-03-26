import { describe, it, expect } from "vitest";
import { ApiError, isApiError, handleApiError } from "../errors";

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
