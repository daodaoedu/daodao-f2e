/**
 * Client-side Circle List hooks with Infinite Scroll Support
 * 封裝 useGetApiV1CirclesInfinite，提供更簡潔的 API
 */

'use client';

import { useMemo } from 'react';
import { useGetApiV1CirclesInfinite } from '../generated/api/circles.client';
import type { CircleSearchParams } from '../model';

/**
 * 使用 Circle 列表（支援無限捲動）
 * 封裝 useGetApiV1CirclesInfinite，自動扁平化資料並計算 hasMore
 */
export const useCircleList = (query: CircleSearchParams, pageSize = 6) => {
  const { data: rawData, ...rest } = useGetApiV1CirclesInfinite(query, {
    swr: { revalidateFirstPage: false },
  });

  // 扁平化資料
  const data = useMemo(
    () => rawData?.flatMap((page) => page?.data ?? []) ?? [],
    [rawData]
  );

  // 計算是否還有更多資料
  const lastPage = rawData?.[rawData.length - 1];
  const hasMore = lastPage
    ? (lastPage.page ?? 0) * (lastPage.pageSize ?? pageSize) <
      (lastPage.totalCount ?? 0)
    : false;

  return {
    ...rest,
    data,
    hasMore,
  };
};

