'use client';

import { useGetApiV1CirclesId } from '../generated/api/circles.client';

import type { CircleIdObject } from '../model';

/**
 * 統一的 Circle 資料 Hook
 * 根據 CircleIdObject 來獲取 Circle 資料
 */
export const useCircle = (circleIdObject: CircleIdObject | null) => {
  const { id } = circleIdObject || {};
  const result = useGetApiV1CirclesId(id || '', {
    swr: {
      enabled: !!id,
    },
  });

  return {
    ...result,
    data: result.data?.data?.[0],
  };
};
