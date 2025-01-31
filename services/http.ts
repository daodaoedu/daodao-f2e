import { getTokenStorage } from "@/utils/storage";

const isDev = process.env.NODE_ENV === "development";

export const BASE_URL = isDev
  ? "/dev-proxy-api"
  : process.env.NEXT_PUBLIC_API_URL;

enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

enum RequestContentType {
  JSON = "application/json",
  FormData = "multipart/form-data",
}

const defaultConfig = {
  contentType: RequestContentType.JSON,
};

export class HttpError extends Error {
  constructor(public status: number, public data: unknown) {
    super(`http status: ${status}\n data: ${JSON.stringify(data, null, 2)}`);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

const createUrl = (
  pathname: string,
  method: RequestMethod,
  source: Record<string, unknown> = {}
) => {
  const url = `${BASE_URL}${pathname}`;

  if (method !== "GET") return url;

  const urlSearchParams = new URLSearchParams();

  Object.entries(source || {}).forEach(([key, value]) => {
    const formattedValue = String(value);
    if (formattedValue !== "" && value != null) {
      urlSearchParams.append(key, formattedValue);
    }
  });

  return `${url}?${urlSearchParams.toString()}`;
};

const createHttp =
  (method: RequestMethod) =>
  async <R = void>(
    pathname: string,
    source?: Record<string, unknown>,
    { contentType } = defaultConfig
  ): Promise<R> => {
    const token = getTokenStorage().get();
    const requestInit: RequestInit = { method };
    const headers = new Headers();

    headers.append("Authorization", `Bearer ${token}`);

    if (contentType === RequestContentType.JSON) {
      headers.append("Content-Type", contentType);
    }

    if (contentType === RequestContentType.FormData && source) {
      const formData = new FormData();

      Object.entries(source).forEach(([key, value]) => {
        formData.append(key, value instanceof Blob ? value : String(value));
      });
      requestInit.body = formData;
    } else if (method !== "GET") {
      requestInit.body = JSON.stringify(source);
    }

    requestInit.headers = headers;

    try {
      const url = createUrl(pathname, method, source);
      const response = await fetch(url, requestInit);
      const responseType = response.headers.get("Content-Type");

      if (response.status >= 400) throw response;

      if (responseType?.includes("application/json")) {
        return response.json();
      }

      throw response;
    } catch (error) {
      if (error instanceof Response) {
        const errorData = await error.json();
        throw new HttpError(error.status, errorData);
      }
      throw error;
    }
  };

const http = {
  get: createHttp(RequestMethod.GET),
  post: createHttp(RequestMethod.POST),
  put: createHttp(RequestMethod.PUT),
  patch: createHttp(RequestMethod.PATCH),
  delete: createHttp(RequestMethod.DELETE),
};

export default http;
