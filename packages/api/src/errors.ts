/**
 * API Error handling utilities
 */
import { extractApiErrorMessage } from "./services/check-in-form-data";
import type { components } from "./types";

type ApiErrorResponse = components["responses"]["BadRequestError"]["content"]["application/json"];

export class ApiError<
  T extends ApiErrorResponse["error"] = ApiErrorResponse["error"],
> extends Error {
  public readonly status: number;

  public readonly data?: T;

  constructor(status: number, message: string, data?: T) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Check if an error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * 把 daodao-server 的錯誤 body（`{ error: { code, message, details } }`，或限流的
 * `{ message, error: "RATE_LIMIT_EXCEEDED" }`）包成 ApiError，保留 status 與 code。
 * server 訊息只有中文，畫面要靠 status／code 轉成當前語系（daodao#353），所以 service 不要丟只剩 message 的 Error。
 */
export function apiErrorFromBody(status: number, body: unknown, fallbackMessage: string): ApiError {
  const inner = (body as { error?: unknown } | null | undefined)?.error;
  const data =
    inner && typeof inner === "object"
      ? inner
      : typeof inner === "string"
        ? { code: inner, message: extractApiErrorMessage(body, fallbackMessage) }
        : undefined;
  return new ApiError(
    status,
    extractApiErrorMessage(body, fallbackMessage),
    data as ConstructorParameters<typeof ApiError>[2]
  );
}

/**
 * Handle API errors
 */
export function handleApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(500, error.message);
  }

  return new ApiError(500, "Unknown error");
}
