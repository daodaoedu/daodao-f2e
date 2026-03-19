import { getRequiredEnv } from "@daodao/config";
import createClient, {
  type ClientPathsWithMethod,
  type FetchResponse,
  type MaybeOptionalInit,
  type Middleware,
} from "openapi-fetch";
import type { paths } from "./types";

export const PREFIX = "dao-dao-server-api" as const;

// ============================================================================
// Mobile Auth Provider
// ============================================================================

/**
 * Mobile 平台的 token provider。
 * 設定後，wrapFetch 改用 Bearer token 驗證，不帶 credentials: "include"。
 * Web（product）不設定此值，維持 cookie 行為。
 */
let _mobileTokenProvider: (() => Promise<string | null>) | null = null;

/** openapi-fetch middleware 實例，用於覆蓋 mobile 的 baseUrl */
let _baseUrlMiddleware: Middleware | null = null;

export function setMobileTokenProvider(fn: () => Promise<string | null>): void {
  _mobileTokenProvider = fn;
}

export function clearMobileTokenProvider(): void {
  _mobileTokenProvider = null;
}

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
    // openapi-fetch 以單一 Request object 呼叫此函式，init 永遠為 undefined。
    // 必須從 input（Request object）讀取現有 headers，不能依賴 init?.headers。
    const existingHeaders: Record<string, string> =
      input instanceof Request
        ? Object.fromEntries(input.headers.entries())
        : Object.fromEntries(new Headers(init?.headers).entries());

    // React Native fetch 不可靠地處理 fetch(Request, init)；
    // 統一提取 url / method / body，以 fetch(urlString, fullInit) 呼叫。
    const url: string =
      input instanceof Request
        ? input.url
        : input instanceof URL
          ? input.toString()
          : input;
    const method: string = input instanceof Request ? input.method : (init?.method ?? "GET");
    const body: BodyInit | null | undefined =
      input instanceof Request ? (input.body as BodyInit | null) : init?.body;

    let fetchInit: RequestInit;

    if (_mobileTokenProvider) {
      // Mobile path：Bearer token，不帶 credentials cookie
      const token = await _mobileTokenProvider();
      fetchInit = {
        method,
        body,
        headers: {
          ...existingHeaders,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };
    } else {
      // Web path：維持現有 cookie 行為
      fetchInit = { method, body, headers: existingHeaders, credentials: "include" };
    }

    const response = await fetch(url, fetchInit);

    // 如果不是 401 或沒有處理器，直接返回
    if (response.status !== 401 || !this.onUnauthorized) {
      return response;
    }

    // 如果是 refresh token endpoint 返回 401，直接返回，避免死鎖
    if (url.includes("/api/v1/auth/refresh")) {
      return response;
    }

    // 如果正在刷新，等待刷新完成後重試
    if (this.isRefreshing && this.refreshPromise) {
      const refreshSuccess = await this.refreshPromise;
      if (refreshSuccess) {
        return this._retryWithFreshToken(input, fetchInit);
      }
      return response;
    }

    // 開始刷新 Token
    this.isRefreshing = true;
    this.refreshPromise = this.onUnauthorized();

    try {
      const refreshSuccess = await this.refreshPromise;
      if (refreshSuccess) {
        return this._retryWithFreshToken(input, fetchInit);
      }
      return response;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  };

  /**
   * 401 refresh 成功後重試原請求，重新取最新 token。
   * fetchInit 保留原始 method/body 等，Authorization 被新 token 覆蓋。
   * fetchInit.headers 是已展開的 plain object，spread order 正確（新 token 覆蓋舊值）。
   */
  private _retryWithFreshToken = async (
    input: RequestInfo | URL,
    fetchInit: RequestInit
  ): Promise<Response> => {
    const url: string =
      input instanceof Request
        ? input.url
        : input instanceof URL
          ? input.toString()
          : input;
    if (_mobileTokenProvider) {
      const newToken = await _mobileTokenProvider();
      return fetch(url, {
        ...fetchInit,
        headers: {
          ...(fetchInit.headers as Record<string, string>),
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        },
      });
    }
    // Web path：cookie 已由 refresh 更新，直接重試
    return fetch(url, fetchInit);
  };
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
 */
export const client = createClient<paths>({
  baseUrl: getRequiredEnv("NEXT_PUBLIC_API_URL"),
  // credentials 由 wrapFetch 依平台設定（web: "include", mobile: 不設定）
  fetch: typeof window === "undefined" ? fetch : unauthorizedHandler.wrapFetch,
});

/**
 * 初始化 mobile 的 API client。
 * - 設定 Bearer token provider（_mobileTokenProvider）
 * - 透過 openapi-fetch middleware 覆蓋 baseUrl（host/protocol/port）
 * 在 AuthProvider mount 時呼叫；在 unmount 時呼叫 clearMobileClient。
 */
export function initMobileClient(config: {
  baseUrl: string;
  getToken: () => Promise<string | null>;
}): void {
  setMobileTokenProvider(config.getToken);

  // 移除舊 middleware，防止 Fast Refresh 重複註冊
  if (_baseUrlMiddleware) {
    client.eject(_baseUrlMiddleware);
  }

  _baseUrlMiddleware = {
    onRequest({ request }) {
      const url = new URL(request.url);
      const base = new URL(config.baseUrl);
      url.protocol = base.protocol;
      url.host = base.host;
      url.port = base.port;
      return new Request(url.toString(), request);
    },
  };

  client.use(_baseUrlMiddleware);
}

/**
 * 清除 mobile client 設定。在 AuthProvider unmount 時呼叫。
 */
export function clearMobileClient(): void {
  clearMobileTokenProvider();
  if (_baseUrlMiddleware) {
    client.eject(_baseUrlMiddleware);
    _baseUrlMiddleware = null;
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
