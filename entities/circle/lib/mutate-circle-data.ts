/**
 * Circle data mutation utilities
 * 未來可直接替換 import 路徑為 @generated/api/circles.client
 */

import { mutate } from 'swr';
import { getGetApiV1CirclesIdKey } from '../generated/api/circles.client';
// 未來替換為:
// import { getGetApiV1CirclesIdKey } from '@/generated/api/circles.client';

import type { CircleIdObject } from '../model';

/**
 * 重新驗證指定 Circle 的資料
 */
export const mutateCircleData = async (circleIdObject: CircleIdObject) => {
  const { id } = circleIdObject;
  await mutate(getGetApiV1CirclesIdKey(id));
};

/**
 * 重新驗證所有 Circle 相關的資料
 */
export const mutateAllCircleData = async () => {
  await mutate((key: unknown) => {
    const pathname = Array.isArray(key) ? key[0] : key;
    return typeof pathname === 'string' && pathname.includes('/circles');
  });
};
