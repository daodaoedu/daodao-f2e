import { authStorage, refreshTokens } from "./auth-storage";

const AI_API_BASE_URL = (process.env.EXPO_PUBLIC_AI_API_URL ?? "https://ai-dev.daodao.so").replace(
  /\/$/,
  ""
);
const REQUEST_TIMEOUT = 30000;

let refreshPromise: Promise<void> | null = null;

interface IAiApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
}

function getUrl(path: string) {
  return path.startsWith("http") ? path : `${AI_API_BASE_URL}${path}`;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }

  await refreshPromise;
  const accessToken = await authStorage.getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  return accessToken;
}

async function getHeaders(options: RequestInit, skipAuth: boolean) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (!skipAuth) {
    const accessToken = await authStorage.getAccessToken();
    if (accessToken) {
      (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
    }
  }

  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return undefined as T;
}

export async function aiApiClient<T>(path: string, options: IAiApiRequestOptions = {}): Promise<T> {
  const { skipAuth = false, timeout = REQUEST_TIMEOUT, ...fetchOptions } = options;
  const headers = await getHeaders(fetchOptions, skipAuth);
  const url = getUrl(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    let response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401 && !skipAuth) {
      try {
        const newToken = await refreshAccessToken();
        (headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
      } catch {
        throw new Error("Authentication required");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed: ${response.status}`);
    }

    return parseResponse<T>(response);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
