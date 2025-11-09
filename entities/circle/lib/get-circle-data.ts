/**
 * Server-side Circle data fetching
 * 未來可直接替換 import 路徑為 @generated/api/circles.server
 */

import {
  getApiV1CirclesId,
  getGetApiV1CirclesIdKey,
} from '../generated/api/circles.server';
// 未來替換為:
// import {
//   getApiV1CirclesId,
//   getGetApiV1CirclesIdKey,
// } from '@/generated/api/circles.server';

import type { CircleIdObject } from '../model';

/**
 * 統一的 Circle 資料獲取函數 (Server 端)
 */
export const getCircleData = async ({ id }: CircleIdObject) => {
  return getApiV1CirclesId(id);
};

/**
 * 統一的 Circle 資料 SWR Key 獲取函數
 */
export const getCircleDataKey = ({ id }: CircleIdObject) => {
  return getGetApiV1CirclesIdKey(id);
};
