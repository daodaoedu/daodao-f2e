import { getRequiredEnv } from "@daodao/config";
import createClient, {
  type ClientPathsWithMethod,
  type FetchResponse,
  type MaybeOptionalInit,
  type Middleware,
} from "openapi-fetch";
import type { paths } from "./types";

export const PREFIX = "dao-dao-server-api" as const;

let mobileTokenProvider: (() => Promise<string | null>) | null = null;
let baseUrlMiddleware: Middleware | null = null;
let mobileApiBaseUrl: string | null = null;

function getDefaultApiBaseUrl(): string {
  const expoApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (expoApiUrl) {
    return expoApiUrl.replace(/\/$/, "");
  }

  try {
    return getRequiredEnv("NEXT_PUBLIC_API_URL").replace(/\/$/, "");
  } catch {
    if (process.env.NODE_ENV === "test") {
      return "http://localhost";
    }

    return "https://api.daodao.so";
  }
}

export function getApiBaseUrl(): string {
  return mobileApiBaseUrl ?? getDefaultApiBaseUrl();
}

export function setMobileTokenProvider(fn: () => Promise<string | null>): void {
  mobileTokenProvider = fn;
}

export function clearMobileTokenProvider(): void {
  mobileTokenProvider = null;
}

const withHeader = (headers: HeadersInit | undefined, key: string, value: string): Headers => {
  const nextHeaders = new Headers(headers);
  nextHeaders.set(key, value);
  return nextHeaders;
};

const mergeHeaders = (base?: HeadersInit, override?: HeadersInit): Headers => {
  const merged = new Headers(base);
  if (override) {
    new Headers(override).forEach((value, key) => {
      merged.set(key, value);
    });
  }
  return merged;
};

const getRequestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

/**
 * Rewrite host/protocol to mobile API base when configured (path + query kept).
 */
const applyMobileBaseUrl = (url: string): string => {
  if (!mobileApiBaseUrl) return url;
  try {
    const next = new URL(url);
    const base = new URL(mobileApiBaseUrl);
    next.protocol = base.protocol;
    next.host = base.host;
    next.port = base.port;
    return next.toString();
  } catch {
    return url;
  }
};

/**
 * Read body from a Request. Avoids `new Request(request, …)` which drops body on RN.
 */
const extractRequestBody = async (request: Request): Promise<BodyInit | undefined> => {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;

  try {
    const buf = await request.clone().arrayBuffer();
    if (buf.byteLength > 0) return buf;
  } catch {
    // fall through
  }

  try {
    const text = await request.clone().text();
    if (text.length > 0) return text;
  } catch {
    // fall through
  }

  return (request.body as BodyInit | null) ?? undefined;
};

/**
 * 執行 fetch，並確保 Authorization + body 都正確送出。
 *
 * openapi-fetch 會呼叫 `fetch(request)`（第一參數是 Request）。
 * mobile token 經 wrapFetch 加在 init.headers。
 *
 * React Native 有兩個已知坑：
 * 1. `fetch(request, { headers })` 常忽略第二參數 headers → 401
 * 2. `new Request(request, { headers })` 常弄丟 POST/DELETE body → 400
 *    （人物誌回答、留言、reaction 都會中）
 *
 * 因此一律拆成 `fetch(urlString, { method, headers, body })`。
 */
const executeFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  if (typeof Request !== "undefined" && input instanceof Request) {
    const headers = mergeHeaders(input.headers, init?.headers);
    const method = (init?.method ?? input.method ?? "GET").toUpperCase();
    const signal = init?.signal ?? input.signal ?? undefined;
    const credentials = init?.credentials ?? input.credentials;
    const url = applyMobileBaseUrl(input.url);

    let body: BodyInit | undefined;
    if (init?.body !== undefined && init.body !== null) {
      body = init.body as BodyInit;
    } else {
      body = await extractRequestBody(input);
    }

    return fetch(url, {
      method,
      headers,
      // GET/HEAD 不得帶 body key：Hermes 遇到 body: null/undefined 的 GET 會 Network request failed
      ...(body != null ? { body } : {}),
      ...(signal ? { signal } : {}),
      // 僅在明確設定時帶 credentials（web cookie）；mobile 用 Bearer
      ...(credentials && credentials !== "same-origin" ? { credentials } : {}),
    });
  }

  if (typeof input === "string" || input instanceof URL) {
    return fetch(applyMobileBaseUrl(getRequestUrl(input)), init);
  }

  return fetch(input, init);
};

/**
 * 401 錯誤處理器類別
 * 封裝 Token 刷新邏輯，避免並發請求時多次刷新
 */
class UnauthorizedHandler {
  private static instance: UnauthorizedHandler | null = null;
  private onUnauthorized: (() => Promise<boolean>) | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private constructor() {}

  static getInstance(): UnauthorizedHandler {
    if (!UnauthorizedHandler.instance) {
      UnauthorizedHandler.instance = new UnauthorizedHandler();
    }
    return UnauthorizedHandler.instance;
  }

  /**
   * 設定 401 錯誤處理回調
   * @param callback 當收到 401 時要執行的回調函數，返回 true 表示刷新成功
   */
  setHandler(callback: () => Promise<boolean>): void {
    this.onUnauthorized = callback;
  }

  /**
   * 清除 401 錯誤處理回調
   */
  clearHandler(): void {
    this.onUnauthorized = null;
  }

  /**
   * 包裝 fetch 以處理 401 錯誤
   * @param input 請求 URL 或 Request 物件
   * @param init 請求選項
   * @returns Response 物件
   */
  wrapFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const fetchInit = await this.createFetchInit(init);
    const url = getRequestUrl(input);
    const response = await executeFetch(input, fetchInit);

    // 如果不是 401 或沒有處理器，直接返回
    if (response.status !== 401 || !this.onUnauthorized) {
      return response;
    }

    // 如果是 refresh token endpoint 返回 401，直接返回，避免死鎖
    const isRefreshEndpoint = url.includes("/api/v1/auth/refresh");
    if (isRefreshEndpoint) {
      return response;
    }

    // 如果正在刷新，等待刷新完成
    if (this.isRefreshing && this.refreshPromise) {
      const refreshSuccess = await this.refreshPromise;
      if (refreshSuccess) {
        return this.retryWithFreshToken(input, fetchInit);
      }
      // 刷新失敗，返回原始 401 響應
      return response;
    }

    // 開始刷新 Token
    this.isRefreshing = true;
    this.refreshPromise = this.onUnauthorized();

    try {
      const refreshSuccess = await this.refreshPromise;
      if (refreshSuccess) {
        return this.retryWithFreshToken(input, fetchInit);
      }
      // 刷新失敗，返回原始 401 響應
      return response;
    } finally {
      // 重置刷新狀態
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  };

  private async createFetchInit(init?: RequestInit): Promise<RequestInit> {
    if (!mobileTokenProvider) {
      return {
        ...init,
        credentials: "include",
      };
    }

    const token = await mobileTokenProvider();
    return {
      ...init,
      headers: token
        ? withHeader(init?.headers, "Authorization", `Bearer ${token}`)
        : init?.headers,
    };
  }

  private async retryWithFreshToken(
    input: RequestInfo | URL,
    fetchInit: RequestInit
  ): Promise<Response> {
    if (!mobileTokenProvider) {
      return executeFetch(input, fetchInit);
    }

    const token = await mobileTokenProvider();
    return executeFetch(input, {
      ...fetchInit,
      headers: token
        ? withHeader(fetchInit.headers, "Authorization", `Bearer ${token}`)
        : fetchInit.headers,
    });
  }
}

/**
 * 全域的 401 錯誤處理器實例
 */
export const unauthorizedHandler = UnauthorizedHandler.getInstance();

/**
 * API Client 配置選項
 */
export interface ApiClientConfig {
  /**
   * API 基礎 URL
   * 如果未提供，會從環境變數 NEXT_PUBLIC_API_URL 讀取
   */
  baseUrl?: string;
}

/**
 * 預設的 API Client 實例
 * 使用環境變數 NEXT_PUBLIC_API_URL 或預設值
 *
 * 一律走 wrapFetch：
 * - web：credentials include（無 mobileTokenProvider）
 * - mobile：Bearer + base URL rewrite（initMobileClient）
 * - 避免 `typeof window` 分叉導致 SSR/test 略過 mobile rewrite
 */
export const client = createClient<paths>({
  baseUrl: getDefaultApiBaseUrl(),
  fetch: unauthorizedHandler.wrapFetch,
});

export function initMobileClient(config: {
  baseUrl: string;
  getToken: () => Promise<string | null>;
}): void {
  setMobileTokenProvider(config.getToken);
  mobileApiBaseUrl = config.baseUrl.replace(/\/$/, "");

  // Legacy: eject any previously registered baseUrl middleware that reconstructed
  // Request objects (RN drops POST body → empty body → HTTP 400 on persona answers).
  if (baseUrlMiddleware) {
    client.eject(baseUrlMiddleware);
    baseUrlMiddleware = null;
  }
  // URL rewrite + auth are handled in executeFetch / createFetchInit — no middleware.
}

export function clearMobileClient(): void {
  clearMobileTokenProvider();
  mobileApiBaseUrl = null;

  if (baseUrlMiddleware) {
    client.eject(baseUrlMiddleware);
    baseUrlMiddleware = null;
  }
}

type InitParam<Init> = Init extends undefined ? never : Init;

/**
 * Generate SWR cache key
 * For use with SWRConfig fallback in Server Components
 * Automatically infers init parameter types based on the path
 *
 * @example
 * ```typescript
 * // Path without required params - no init needed
 * const key1 = getSwrKey('/api/v1/users');
 * // Type: readonly ["dao-dao-server-api", "/api/v1/users"]
 *
 * // Path with required params - init required
 * const key2 = getSwrKey('/api/v1/users/{id}', {
 *   params: { path: { id: '123' } } // ✅ TypeScript will infer the correct type
 * });
 * // Type: readonly ["dao-dao-server-api", "/api/v1/users/{id}", {...}]
 *
 * // Use in Server Component with SWRConfig
 * const response = await client.GET(path, init);
 * return (
 *   <SWRConfig value={{ fallback: { [unstable_serialize(key)]: response } }}>
 *     {children}
 *   </SWRConfig>
 * );
 * ```
 */
export const getSwrKey = <
  Path extends ClientPathsWithMethod<typeof client, "get">,
  Init extends MaybeOptionalInit<paths[Path], "get"> = MaybeOptionalInit<paths[Path], "get">,
>(
  path: Path,
  init: InitParam<Init>
) => [PREFIX, path, init] as const;

/**
 * Generate SWR cache key and fetch data in one call
 * Combines `getSwrKey` and API call for convenience
 * Returns both the key and response for SWRConfig fallback
 *
 * @param path - API endpoint path (automatically inferred from OpenAPI schema)
 * @param init - Optional init parameter (params, headers, etc.) based on the path requirements
 * @returns Promise of [swrKey, response] tuple for SWRConfig fallback
 *
 * @example
 * ```typescript
 * // Path without required params - no init needed
 * const [key1, response1] = await getSwrKeyWithResponse('/api/v1/users');
 *
 * // Path with required params - init required
 * const [key2, response2] = await getSwrKeyWithResponse('/api/v1/users/{id}', {
 *   params: { path: { id: '123' } } // ✅ TypeScript will infer the correct type
 * });
 *
 * // Use in Server Component with SWRConfig
 * return (
 *   <SWRConfig value={{ fallback: { [unstable_serialize(key)]: response } }}>
 *     {children}
 *   </SWRConfig>
 * );
 * ```
 *
 * @see getSwrKey - If you only need the cache key
 */
export const getSwrKeyWithResponse = async <
  Path extends ClientPathsWithMethod<typeof client, "get">,
  Init extends MaybeOptionalInit<paths[Path], "get"> = MaybeOptionalInit<paths[Path], "get">,
  Media extends `${string}/${string}` = "application/json",
>(
  path: Path,
  init: InitParam<Init>
): Promise<
  readonly [
    readonly [typeof PREFIX, Path, InitParam<Init>?],
    FetchResponse<paths[Path]["get"], Init, Media>,
  ]
> => Promise.all([getSwrKey(path, init), client.GET(path, init)] as const);
