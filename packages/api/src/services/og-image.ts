/**
 * OG Image API Service
 * 提供從網址提取 og:image 的 API 調用函數
 */

import { apiFetch } from "../next-api-client";

// ============================================================================
// Types
// ============================================================================

export interface IExtractOgImageParams {
  /**
   * 要提取 og:image 的網址
   */
  url: string;
  /**
   * 是否強制刷新快取
   */
  refresh?: boolean;
}

export interface IExtractOgImageResponse {
  /**
   * og:image URL
   */
  ogImageUrl: string;
  /**
   * 網頁標題（可選）
   */
  title?: string;
  /**
   * 網頁描述（可選）
   */
  description?: string;
  /**
   * 是否來自快取
   */
  cached: boolean;
  /**
   * 提取時間戳
   */
  timestamp: number;
}

// ============================================================================
// Client Functions (用於 Server Components 或直接調用)
// ============================================================================

/**
 * 從指定網址提取 og:image
 *
 * 注意：此函數調用的是 Next.js API Route，因此需要在 Next.js 應用中使用
 *
 * @param params - 包含要提取的網址和可選的刷新參數
 * @returns 提取後的圖片資訊
 *
 * @example
 * ```typescript
 * // Server Component
 * const result = await extractOgImage({ url: "https://example.com/article" });
 * if (result.success) {
 *   console.log(result.data.ogImageUrl); // og:image URL
 *   console.log(result.data.cached); // 是否來自快取
 * }
 *
 * // Client Component
 * const result = await extractOgImage({
 *   url: "https://example.com/article",
 *   refresh: true // 強制刷新快取
 * });
 * ```
 */
export const extractOgImage = async (
  params: IExtractOgImageParams
): Promise<
  { success: true; data: IExtractOgImageResponse } | { success: false; error: string }
> => {
  const queryParams = new URLSearchParams({
    url: params.url,
  });

  if (params.refresh) {
    queryParams.append("refresh", "true");
  }

  return apiFetch<IExtractOgImageResponse>(`/api/og-image?${queryParams.toString()}`);
};
