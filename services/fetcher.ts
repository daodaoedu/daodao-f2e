import type { ApiResponseValidatorsApiErrorResponseSchema } from '@/generated/models';
import { getTokenStorage } from '@/shared/lib/storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

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
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  responseType?: 'json' | 'blob';
  headers?: Record<string, string>;
}

export const fetcher = async <T>({
  url,
  method,
  params,
  data,
  responseType = 'json',
  headers = {},
}: FetcherConfig): Promise<T> => {
  const urlObject = new URL(url, API_BASE_URL);
  const token = getTokenStorage().get();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObject.searchParams.append(key, String(value));
      }
    });
  }

  const fullUrl = urlObject.toString();

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (data && method !== 'GET') {
    requestInit.body = JSON.stringify(data);
  }

  const response = await fetch(fullUrl, requestInit);
  const { status } = response;

  if (!response.ok) {
    try {
      const result: ApiResponseValidatorsApiErrorResponseSchema =
        await response.json();

      if (result.error?.message) {
        throw new ApiError(status, result.error.message, result.error);
      }
      throw new ApiError(status, `HTTP Status: ${status}`, result.error);
    } catch {
      throw new ApiError(400, 'Unknown Error', {
        code: 'UNKNOWN_ERROR',
        message: 'Unknown Error',
      });
    }
  }

  if (status === 204) {
    return undefined as T;
  }

  return response[responseType]();
};
