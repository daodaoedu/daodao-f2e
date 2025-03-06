import { z } from 'zod';
import { getTokenStorage } from '@/utils/storage';
import { getBackendUrl } from '@/utils/env';

export const BASE_URL = getBackendUrl();

enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export enum RequestContentType {
  JSON = 'application/json',
  FormData = 'multipart/form-data',
}

export class HttpError {
  status: number;

  info?: { message: string };

  constructor(status: number, info?: { message: string }) {
    this.status = status;
    this.info = info;
  }
}

const isObject = (arg: unknown): arg is Record<string, unknown> =>
  z.object({}).safeParse(arg).success;

const validValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.instanceof(Blob),
]);

type ValidValueType = z.infer<typeof validValueSchema>;

const isValidValue = (value: unknown): value is ValidValueType =>
  validValueSchema.safeParse(value).success;

const serializeNestedObject = <T extends URLSearchParams | FormData>(
  source: Record<string, unknown>,
  formattedData: T,
  prefix = ''
) => {
  const append = (key: string) => (value: ValidValueType) => {
    if (formattedData instanceof URLSearchParams) {
      formattedData.append(key, encodeURIComponent(String(value)));
    } else if (typeof value === 'string' || value instanceof Blob) {
      formattedData.append(key, value);
    }
  };

  Object.entries(source || {}).forEach(([key, value]) => {
    if (value === '' || value == null) return;

    const keyWithPrefix = `${prefix}${key}`;
    if (isValidValue(value)) {
      append(keyWithPrefix)(value);
    } else if (Array.isArray(value)) {
      value.forEach(append(`${keyWithPrefix}.`));
    } else if (isObject(value)) {
      serializeNestedObject(value, formattedData, `${keyWithPrefix}.`);
    }
  });

  return formattedData;
};

const createUrl = (
  pathname: string,
  method: RequestMethod,
  source: Record<string, unknown> = {}
) => {
  const url = `${BASE_URL}${pathname}`;

  if (method !== RequestMethod.GET) return url;

  const urlSearchParams = new URLSearchParams();

  return `${url}?${serializeNestedObject(source, urlSearchParams).toString()}`;
};

const createBody = (
  method: RequestMethod,
  source?: Record<string, unknown>,
  contentType: RequestContentType = RequestContentType.JSON
) => {
  if (method === RequestMethod.GET || !source) {
    return undefined;
  }

  if (contentType === RequestContentType.JSON) {
    return JSON.stringify(source);
  }

  if (contentType === RequestContentType.FormData) {
    const formData = new FormData();
    return serializeNestedObject(source, formData);
  }

  return undefined;
};

interface HttpOptions {
  pathname: string;
  method?: RequestMethod;
  source?: Record<string, unknown>;
  contentType?: RequestContentType;
}

const http = async <R = void>({
  pathname,
  method = RequestMethod.GET,
  source,
  contentType = RequestContentType.JSON,
}: HttpOptions) => {
  const url = createUrl(pathname, method, source);
  const body = createBody(method, source, contentType);
  const token = getTokenStorage().get();
  const headers = new Headers();

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  if (contentType === RequestContentType.JSON) {
    headers.append('Content-Type', contentType);
  }

  const response = await fetch(url, { method, headers, body });

  if (!response.ok) {
    const error = await response.json();
    throw new HttpError(response.status, error);
  }

  return response.json() as Promise<R>;
};

export type FetcherParams = string | [string, ...unknown[]];

export const fetcher = <R = void>(params: FetcherParams): Promise<R> => {
  const [pathname, ...args] = Array.isArray(params) ? params : [params];
  const source = args
    .filter(isObject)
    .reduce((acc, curr) => Object.assign(acc, curr), {});

  return http<R>({ pathname, source });
};

const createMutation =
  (method: RequestMethod) =>
  <R = void>(
    pathname: string,
    source?: Record<string, unknown>,
    contentType = RequestContentType.JSON
  ): Promise<R> =>
    http<R>({ pathname, source, method, contentType });

export const mutations = {
  post: createMutation(RequestMethod.POST),
  put: createMutation(RequestMethod.PUT),
  patch: createMutation(RequestMethod.PATCH),
  delete: createMutation(RequestMethod.DELETE),
};
