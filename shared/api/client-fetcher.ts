import { getTokenStorage } from '@/shared/lib/storage';
import { ApiResponseValidatorsApiErrorResponseSchema } from '@/models/apiResponseValidatorsApiErrorResponseSchema';
import { ApiError, FetcherConfig, getFullUrl } from './common';

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
      const result: ApiResponseValidatorsApiErrorResponseSchema =
        await response.json();

      if (result.error?.message) {
        throw new ApiError(status, result.error.message, result.error);
      }
      throw new ApiError(status, `HTTP Status: ${status}`, result.error);
    } catch (error) {
      throw new ApiError(400, 'Unknown Error', {
        code: 'UNKNOWN_ERROR',
        error,
      });
    }
  }

  if (status === 204) {
    return undefined as T;
  }

  return response.json() as T;
};
