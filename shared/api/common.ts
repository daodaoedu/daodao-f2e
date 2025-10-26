export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError<T = unknown> extends Error {
  public readonly status: number;

  public readonly data?: T;

  constructor(status: number, message: string, data?: T) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface FetcherConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, unknown>;
  data?: unknown;
  responseType?: 'json' | 'blob';
  headers?: Record<string, string>;
}

export const getFullUrl = (url: string, params?: Record<string, unknown>) => {
  const urlObject = new URL(url, API_BASE_URL);

  const allowedOrigin = new URL(API_BASE_URL).origin;

  if (urlObject.origin !== allowedOrigin) {
    throw new ApiError(
      400,
      `SSR vulnerability: Refusing to make request to untrusted origin: ${urlObject.origin}`
    );
  }

  if (typeof params === 'object' && params !== null) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObject.searchParams.append(key, String(value));
      }
    });
  }

  return urlObject.toString();
};
