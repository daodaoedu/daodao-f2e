"use client";

/**
 * Location API Hooks
 * 提供國家和城市相關的 React Hooks（用於 Client Components）
 */

import { useQuery } from "../hooks";

// ============================================================================
// Types
// ============================================================================

export interface IGetCitiesParams {
  /** 國家代碼（ISO 3166-1 alpha-2） */
  country?: string;
  /** 搜尋關鍵字（支援城市代碼、中文名、英文名） */
  search?: string;
  /** 語系，決定城市名稱顯示語言 */
  locale?: "zh-TW" | "en" | "default";
  /** 回傳數量限制 */
  limit?: number;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 獲取國家列表的 Hook
 */
export const useCountries = () => {
  return useQuery("/api/v1/cities/countries");
};

/**
 * 獲取城市列表的 Hook
 * @param params 查詢參數
 * @param params.country 國家代碼篩選（ISO 3166-1 alpha-2，如 TW, JP, US）
 * @param params.search 搜尋關鍵字
 * @param params.locale 語系
 * @param params.limit 回傳數量限制
 */
export const useCities = (params?: IGetCitiesParams) => {
  return useQuery("/api/v1/cities", {
    params: {
      query: params,
    },
  });
};
