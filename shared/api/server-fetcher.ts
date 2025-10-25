'use server';

import { headers as getHeaders } from 'next/headers';
import { FetcherConfig, getFullUrl, handleResponse } from './common';

export const serverFetcher = async <T>({
  url,
  method,
  params,
  data,
  headers = {},
}: FetcherConfig): Promise<T> => {
  const nextHeaders = await getHeaders();
  const headersObject = nextHeaders
    ? Object.fromEntries(nextHeaders.entries())
    : {};

  // 移除可能導致壓縮問題的 headers
  delete headersObject['accept-encoding'];
  delete headersObject['Accept-Encoding'];

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headersObject,
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
