import { getTokenStorage } from '@/shared/lib/storage';
import { ApiResponseValidatorsApiErrorResponseSchema } from '@/models/apiResponseValidatorsApiErrorResponseSchema';
import { API_BASE_URL, ApiError } from './common';

export interface FetcherConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, unknown>;
  data?: unknown;
  responseType?: 'json' | 'blob';
  headers?: Record<string, string>;
}

export const clientFetcher = async <T>({
  url,
  method,
  params,
  data,
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

  const { status, ok } = response;

  if (!ok) {
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

  return response.json() as T;
};
