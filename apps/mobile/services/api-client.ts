import { extractApiErrorMessage } from "@daodao/api";
import { authStorage, refreshTokens } from "./auth-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.daodao.so";
const API_URL = `${API_BASE_URL.replace(/\/$/, "")}/api/v1`;
const REQUEST_TIMEOUT = 30000;

interface IRequestOptions extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
}

async function readJsonError(response: Response) {
  const data = await response.json().catch(() => ({}));
  return extractApiErrorMessage(data, `Request failed: ${response.status}`);
}

async function createHeaders(headers?: HeadersInit, skipAuth?: boolean) {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("Content-Type", nextHeaders.get("Content-Type") ?? "application/json");

  if (!skipAuth) {
    const accessToken = await authStorage.getAccessToken();
    if (accessToken) {
      nextHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  return nextHeaders;
}

export async function apiClient<T>(endpoint: string, options: IRequestOptions = {}): Promise<T> {
  const { skipAuth = false, timeout = REQUEST_TIMEOUT, ...fetchOptions } = options;
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const headers = await createHeaders(fetchOptions.headers, skipAuth);
    let response = await fetch(url, { ...fetchOptions, headers, signal: controller.signal });

    if (response.status === 401 && !skipAuth) {
      await refreshTokens();
      const retryHeaders = await createHeaders(fetchOptions.headers, skipAuth);
      response = await fetch(url, {
        ...fetchOptions,
        headers: retryHeaders,
        signal: controller.signal,
      });
    }

    if (!response.ok) {
      throw new Error(await readJsonError(response));
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json();
    }

    return undefined as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: <T>(endpoint: string, options?: IRequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: IRequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: IRequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: IRequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: IRequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
