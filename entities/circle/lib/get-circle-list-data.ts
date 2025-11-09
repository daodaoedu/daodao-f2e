/**
 * Server-side Circle List data fetching
 * 統一的 Circle 列表資料獲取函數（Server 端）
 */

import {
  getApiV1Circles,
  getGetApiV1CirclesKey,
} from '../generated/api/circles.server';
import type { CircleSearchParams } from '../model';

/**
 * 統一的 Circle 列表資料獲取函數 (Server 端)
 */
export const getCircleListData = async (params?: CircleSearchParams) => {
  return getApiV1Circles(params);
};

/**
 * 統一的 Circle 列表資料 SWR Key 獲取函數
 */
export const getCircleListDataKey = (params?: CircleSearchParams) => {
  return getGetApiV1CirclesKey(params);
};

