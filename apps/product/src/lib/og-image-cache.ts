/**
 * OG Image Cache
 * 提供多層快取機制來暫存 og:image 提取結果
 */

import { LRUCache } from "lru-cache";

// ============================================================================
// Types
// ============================================================================

export interface IOgImageCacheData {
  /**
   * 原始的 og:image URL
   */
  ogImageUrl: string;
  /**
   * 提取時間戳（用於計算快取年齡）
   */
  timestamp: number;
  /**
   * 網頁標題（可選，從 og:title 提取）
   */
  title?: string;
  /**
   * 網頁描述（可選，從 og:description 提取）
   */
  description?: string;
}

// ============================================================================
// LRU Cache (記憶體快取)
// ============================================================================

/**
 * LRU Cache 配置
 * - max: 最多快取 1000 個網址的結果
 * - ttl: 快取時間 24 小時（86400000 毫秒）
 * - updateAgeOnGet: 每次讀取時更新快取年齡
 */
const lruCache = new LRUCache<string, IOgImageCacheData>({
  max: 1000,
  ttl: 24 * 60 * 60 * 1000, // 24 小時
  updateAgeOnGet: true,
});

/**
 * 從 LRU Cache 取得快取資料
 */
export const getCachedOgImage = (url: string): IOgImageCacheData | undefined => {
  return lruCache.get(url);
};

/**
 * 將資料存入 LRU Cache
 */
export const setCachedOgImage = (url: string, data: IOgImageCacheData): void => {
  lruCache.set(url, data);
};

/**
 * 清除指定 URL 的快取
 */
export const clearCachedOgImage = (url: string): void => {
  lruCache.delete(url);
};

/**
 * 清除所有快取
 */
export const clearAllCachedOgImage = (): void => {
  lruCache.clear();
};

/**
 * 取得快取統計資訊
 */
export const getCacheStats = () => {
  return {
    size: lruCache.size,
    max: lruCache.max,
    calculatedSize: lruCache.calculatedSize,
  };
};

// ============================================================================
// Redis Cache (可選，用於跨進程共享)
// ============================================================================

/**
 * Redis 快取實作（可選）
 * 如果需要跨進程或跨伺服器共享快取，可以使用 Redis
 * 
 * @example
 * ```typescript
 * import { Redis } from 'ioredis';
 * 
 * const redis = new Redis(process.env.REDIS_URL);
 * 
 * export const getRedisCachedOgImage = async (url: string): Promise<IOgImageCacheData | null> => {
 *   const cached = await redis.get(`og-image:${url}`);
 *   return cached ? JSON.parse(cached) : null;
 * };
 * 
 * export const setRedisCachedOgImage = async (url: string, data: IOgImageCacheData): Promise<void> => {
 *   await redis.setex(`og-image:${url}`, 86400, JSON.stringify(data)); // 24 小時
 * };
 * ```
 */

// ============================================================================
// 快取策略
// ============================================================================

/**
 * 快取策略說明：
 * 
 * 1. **LRU Cache（記憶體快取）**
 *    - 優點：速度快，無需外部依賴
 *    - 缺點：僅限單一進程，重啟後消失
 *    - 適用：單一伺服器或 Vercel Fluid Compute 環境
 * 
 * 2. **Redis Cache（外部快取）**
 *    - 優點：跨進程共享，持久化
 *    - 缺點：需要額外基礎設施，有網路延遲
 *    - 適用：多伺服器環境或需要持久化的場景
 * 
 * 3. **混合策略**
 *    - 先檢查 LRU Cache（快速）
 *    - 如果未命中，檢查 Redis Cache
 *    - 如果都未命中，才進行實際爬取
 *    - 爬取結果同時存入兩個快取
 * 
 * 4. **TTL 策略**
 *    - og:image 通常不會頻繁變更，建議 TTL 為 24 小時
 *    - 可以根據需求調整，例如：
 *      - 新聞網站：1-6 小時
 *      - 部落格文章：24-48 小時
 *      - 產品頁面：12-24 小時
 * 
 * 5. **快取鍵設計**
 *    - 使用完整的 URL（包含 protocol、host、path、query）
 *    - 確保 URL 標準化（移除 trailing slash、統一大小寫等）
 */
