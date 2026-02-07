"use client";

/**
 * OG Image API Hooks
 * 提供從網址提取 og:image 的 React Hooks
 */

import { useCallback } from "react";
import useSWR from "swr";
import {
  extractOgImage,
  type IExtractOgImageParams,
  type IExtractOgImageResponse,
} from "./og-image";

// ============================================================================
// SWR Fetcher
// ============================================================================

/**
 * SWR fetcher 函數
 */
const ogImageFetcher = async (key: string): Promise<IExtractOgImageResponse> => {
  // key 格式: "og-image:url:https://example.com:refresh:true"
  const parts = key.split(":");
  const urlPart = parts[2];
  const refreshPart = parts[4];

  if (!urlPart) {
    throw new Error("Invalid SWR key: missing URL");
  }

  const refreshParam = refreshPart === "true";

  const result = await extractOgImage({
    url: decodeURIComponent(urlPart),
    refresh: refreshParam,
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
};

// ============================================================================
// Hooks (用於 Client Components)
// ============================================================================

/**
 * Hook 用於提取 og:image（使用 SWR）
 *
 * 此 hook 會自動處理快取、去重和重新驗證
 *
 * @param url - 要提取 og:image 的網址（如果為 null 或 undefined，則不會發起請求）
 * @param options - 可選配置
 * @param options.refresh - 是否強制刷新快取（預設 false）
 * @param options.revalidateOnFocus - 是否在視窗獲得焦點時重新驗證（預設 false）
 * @param options.revalidateOnReconnect - 是否在重新連線時重新驗證（預設 true）
 *
 * @example
 * ```typescript
 * "use client";
 *
 * function MyComponent() {
 *   const { data, error, isLoading, mutate } = useExtractOgImage("https://example.com/article");
 *
 *   const handleRefresh = () => {
 *     mutate(); // 手動重新驗證
 *   };
 *
 *   if (isLoading) return <div>載入中...</div>;
 *   if (error) return <div>錯誤: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <img src={data?.ogImageUrl} alt={data?.title} />
 *       <button onClick={handleRefresh}>刷新</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // 條件式獲取
 * function ResourceCard({ url }: { url?: string }) {
 *   const { data, isLoading } = useExtractOgImage(url); // url 為 undefined 時不會發起請求
 *
 *   return (
 *     <div>
 *       {isLoading && <div>載入中...</div>}
 *       {data && <img src={data.ogImageUrl} />}
 *     </div>
 *   );
 * }
 * ```
 */
export const useExtractOgImage = (
  url: string | null | undefined,
  options?: {
    refresh?: boolean;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
  }
) => {
  const refresh = options?.refresh ?? false;
  const revalidateOnFocus = options?.revalidateOnFocus ?? false;
  const revalidateOnReconnect = options?.revalidateOnReconnect ?? true;

  // 構建 SWR key
  const swrKey = url ? `og-image:url:${encodeURIComponent(url)}:refresh:${refresh}` : null;

  const { data, error, isLoading, mutate } = useSWR<IExtractOgImageResponse>(
    swrKey,
    ogImageFetcher,
    {
      revalidateOnFocus,
      revalidateOnReconnect,
      // 不自動重新驗證，因為 og:image 通常不會頻繁變更
      revalidateIfStale: false,
      // 錯誤時不重試（因為可能是網址無效等永久性錯誤）
      shouldRetryOnError: false,
      // 保持之前的資料，避免閃爍
      keepPreviousData: true,
    }
  );

  /**
   * 手動觸發提取（用於需要手動觸發的場景）
   *
   * @example
   * ```typescript
   * const { trigger } = useExtractOgImageTrigger();
   *
   * const handleExtract = async () => {
   *   const result = await trigger({ url: "https://example.com" });
   *   if (result.success) {
   *     console.log(result.data.ogImageUrl);
   *   }
   * };
   * ```
   */
  const trigger = useCallback(
    async (
      params: IExtractOgImageParams
    ): Promise<
      { success: true; data: IExtractOgImageResponse } | { success: false; error: string }
    > => {
      try {
        const result = await extractOgImage(params);
        return result;
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    },
    []
  );

  return {
    data,
    error: error as Error | undefined,
    isLoading,
    /**
     * 手動重新驗證
     */
    mutate,
    /**
     * 手動觸發提取（不使用 SWR 快取）
     */
    trigger,
  };
};
