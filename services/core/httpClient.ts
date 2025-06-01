import { z } from 'zod';
import { getTokenStorage } from '@/utils/storage';
import getEnv from '@/utils/env';

export const V1_BASE_URL = 'https://api.daoedu.tw';
export const BASE_URL = getEnv().apiUrl;

enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export enum RequestContentType {
  JSON = "application/json",
  FormData = "multipart/form-data",
}

export class HttpError {
  status: number;

  info?: { message: string };

  constructor(status: number, info?: { message: string }) {
    this.status = status;
    this.info = info;
  }
}

const isRecord = (arg: unknown): arg is Record<string, unknown> =>
  z.record(z.string(), z.unknown()).safeParse(arg).success;

const validValueSchema = z.union([
  z.string().min(1),
  z.number(),
  z.boolean(),
  z.instanceof(Blob),
]);

type ValidValueType = z.infer<typeof validValueSchema>;

const isValidValue = (value: unknown): value is ValidValueType =>
  validValueSchema.safeParse(value).success;

const serialize =
  <T extends URLSearchParams | FormData>(
    formattedData: T,
    keys: string[] = []
  ) =>
  (source: unknown) => {
    const append = (key: string) => (value: ValidValueType) => {
      if (formattedData instanceof URLSearchParams) {
        formattedData.append(key, encodeURIComponent(String(value)));
      } else if (typeof value === "string" || value instanceof Blob) {
        formattedData.append(key, value);
      }
    };

    if (isValidValue(source)) {
      append(keys.join("."))(source);
    } else if (Array.isArray(source)) {
      source.forEach(serialize(formattedData, keys));
    } else if (isRecord(source)) {
      Object.entries(source || {}).forEach(([key, value]) => {
        serialize(formattedData, keys.concat(key))(value);
      });
    }

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

  return `${url}?${serialize(urlSearchParams)(source)}`;
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
    return serialize(formData)(source);
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
    headers.append("Authorization", `Bearer ${token}`);
  }

  if (contentType === RequestContentType.JSON) {
    headers.append("Content-Type", contentType);
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
  const source = args.filter(isRecord).reduce(Object.assign, {});

  return http<R>({ pathname, source });
};

export const fetcherV1 = <R = void>(
  params: FetcherParams,
  options: RequestInit = {}
): Promise<R> =>
  fetch(`${V1_BASE_URL}${params}`, options).then((res) => res.json());

const getArg = (source: unknown): Record<string, unknown> => {
  if (isRecord(source) && isRecord(source.arg)) {
    return source.arg;
  }
  return {};
};

const createMutation =
  (method: RequestMethod) =>
  <R = void>(
    pathname: string,
    source?: unknown,
    contentType = RequestContentType.JSON
  ): Promise<R> =>
    http<R>({ pathname, source: getArg(source), method, contentType });

export const mutations = {
  post: createMutation(RequestMethod.POST),
  put: createMutation(RequestMethod.PUT),
  patch: createMutation(RequestMethod.PATCH),
  delete: createMutation(RequestMethod.DELETE),
};
