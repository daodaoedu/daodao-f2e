import { getTokenStorage } from '@/shared/lib/storage';
import {
  ApiError,
  ApiErrorResponseSchema,
  FetcherConfig,
  getFullUrl,
} from './common';

export const clientFetcher = async <T>({
  url,
  method,
  params,
  data,
  headers = {},
}: FetcherConfig): Promise<T> => {
  const token = getTokenStorage().get();

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

  const fullUrl = getFullUrl(url, params);

  const response = await fetch(fullUrl, requestInit);

  const { status, ok } = response;

  if (!ok) {
    try {
      const result: ApiErrorResponseSchema = await response.json();

      throw new ApiError(status, result.error.message, result.error);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ApiError(status, error.message, error);
      }
      throw new ApiError(status, '系統異常，請稍後再試', {
        code: 'SYSTEM_ERROR',
        message: '系統異常，請稍後再試',
      });
    }
  }

  if (status === 204) {
    return undefined as T;
  }

  return response.json() as T;
};
