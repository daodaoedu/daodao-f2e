import { getTokenStorage } from '@/utils/storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  public readonly status: number;

  public readonly data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
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
  headers?: Record<string, string>;
}

export const fetcher = async <T>({
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
  const { status } = response;

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new ApiError(status, `HTTP Status: ${status}`, error);
    } catch {
      throw new ApiError(-1, 'HTTP Status: Unknown', {
        message: 'Unknown Error',
      });
    }
  }

  if (status === 204) {
    return undefined as T;
  }

  return response.json();
};
