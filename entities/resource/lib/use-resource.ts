'use client';

import { useQuery } from '@/shared/api';
import type { ResourceIdObject, ResourceSearchParams } from '../model';

/**
 * 統一的 Resource 資料 Hook
 * 根據 ResourceIdObject 來獲取 Resource 資料
 */
export const useResource = (resourceIdObject: ResourceIdObject | null) => {
  const { resourceId } = resourceIdObject || {};

  const result = useQuery(
    '/api/v1/resources/{resourceId}',
    resourceId ? { params: { path: { resourceId } } } : null
  );

  return {
    ...result,
    data: result.data?.data,
  };
};

/**
 * 獲取 Resource 列表的 Hook
 */
export const useResourceList = (searchParams?: ResourceSearchParams) => {
  return useQuery('/api/v1/resources/', {
    params: {
      query: {
        cursor: searchParams?.cursor,
      },
    },
  });
};
