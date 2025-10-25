import { getTokenStorage } from '@/shared/lib/storage';
import { FetcherConfig, getFullUrl, handleResponse } from './common';

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

  return handleResponse<T>(response);
};
