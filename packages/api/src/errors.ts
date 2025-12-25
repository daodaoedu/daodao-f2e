/**
 * API Error handling utilities
 */
import type { components } from "./types";

type ApiErrorResponse = components["schemas"]["api-response.validators_apiErrorResponseSchema"];

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
