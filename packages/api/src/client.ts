import { getRequiredEnv } from "@daodao/config";
import createClient, {
  type ClientPathsWithMethod,
  type FetchResponse,
  type MaybeOptionalInit,
} from "openapi-fetch";
import type { paths } from "./types";

export const PREFIX = "dao-dao-server-api" as const;

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
    // 確保 credentials 被設置，以支援跨域 cookie
    const fetchInit: RequestInit = {
      ...init,
      credentials: "include",
    };

    let url: string;
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input.url;
    }
    const response = await fetch(input, fetchInit);

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
        // 刷新成功，重試原請求（確保 credentials 被傳遞）
        return fetch(input, fetchInit);
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
        // 刷新成功，重試原請求（確保 credentials 被傳遞）
        return fetch(input, fetchInit);
      }
      // 刷新失敗，返回原始 401 響應
      return response;
    } finally {
      // 重置刷新狀態
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
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
  credentials: "include",
  fetch: typeof window === "undefined" ? fetch : unauthorizedHandler.wrapFetch,
});

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
