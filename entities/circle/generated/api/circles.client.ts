import useSWR from 'swr';
import type { Key, SWRConfiguration } from 'swr';

import useSWRInfinite from 'swr/infinite';
import type { SWRInfiniteConfiguration, SWRInfiniteKeyLoader } from 'swr/infinite';

import type {
  CircleValidatorsCircleDetailResponseSchema as CircleDetailResponse,
  CircleValidatorsCircleListResponseSchema as CircleListResponse,
  CircleValidatorsCircleSearchParamsSchema as CircleSearchParams,
  CircleValidatorsCircleSchema as Circle,
} from '../models';

/**
 * 取得單一 Circle 資料
 * 對應 generated API: getApiV1CirclesId
 */
export const getApiV1CirclesId = async (
  id: string
): Promise<CircleDetailResponse> => {
  const mockData = await fetch('/data/circles-mock.json').then((res) =>
    res.json()
  );
  const circle = mockData.data.find((item: Circle) => item._id === id);

  if (!circle) {
    throw new Error('Circle not found');
  }

  return {
    data: [circle],
  };
};

/**
 * 取得 Circle 列表
 * 對應 generated API: getApiV1Circles
 */
export const getApiV1Circles = async (
  params?: CircleSearchParams
): Promise<CircleListResponse> => {
  const mockData = await fetch('/data/circles-mock.json').then((res) =>
    res.json()
  );

  let filteredData = mockData.data;

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredData = filteredData.filter(
      (circle: Circle) =>
        circle.title.toLowerCase().includes(searchLower) ||
        circle.content.toLowerCase().includes(searchLower)
    );
  }

  if (params?.area) {
    const areas = Array.isArray(params.area) ? params.area : [params.area];
    filteredData = filteredData.filter((circle: Circle) =>
      areas.includes(circle.area)
    );
  }

  if (params?.category) {
    const categories = Array.isArray(params.category)
      ? params.category
      : [params.category];
    filteredData = filteredData.filter((circle: Circle) =>
      circle.category.some((cat) => categories.includes(cat))
    );
  }

  return {
    data: filteredData,
    page: params?.page || 1,
    pageSize: params?.pageSize || 10,
    totalCount: filteredData.length,
    totalPages: Math.ceil(filteredData.length / (params?.pageSize || 10)),
  };
};

/**
 * 取得單一 Circle 的 SWR Key
 * 對應 generated API: getGetApiV1CirclesIdKey
 */
export const getGetApiV1CirclesIdKey = (id: string) =>
  [`/api/v1/circles/${id}`] as const;

/**
 * 取得 Circle 列表的 SWR Key
 * 對應 generated API: getGetApiV1CirclesKey
 */
export const getGetApiV1CirclesKey = (params?: CircleSearchParams) =>
  [`/api/v1/circles/`, ...(params ? [params] : [])] as const;

/**
 * 取得 Circle 列表的 Infinite Key Loader
 * 對應 generated API: getGetApiV1CirclesInfiniteKeyLoader
 */
export const getGetApiV1CirclesInfiniteKeyLoader = (
  params?: CircleSearchParams
) => {
  return (
    page: number,
    previousPageData: Awaited<ReturnType<typeof getApiV1Circles>>
  ) => {
    if (previousPageData && !previousPageData.data) return null;

    return [
      `/api/v1/circles/`,
      ...(params ? [{ ...params, page }] : [{ page }]),
    ] as const;
  };
};

// SWR Hooks

/**
 * 使用 SWR 取得單一 Circle
 * 對應 generated API: useGetApiV1CirclesId
 */
export const useGetApiV1CirclesId = <TError = Error>(
  id: string,
  options?: {
    swr?: SWRConfiguration<
      Awaited<ReturnType<typeof getApiV1CirclesId>>,
      TError
    > & { swrKey?: Key; enabled?: boolean };
  }
) => {
  const { swr: swrOptions } = options ?? {};

  const isEnabled = swrOptions?.enabled !== false && !!id;
  const swrKey =
    swrOptions?.swrKey ?? (() => (isEnabled ? getGetApiV1CirclesIdKey(id) : null));
  const swrFn = () => getApiV1CirclesId(id);

  const query = useSWR<Awaited<ReturnType<typeof swrFn>>, TError>(
    swrKey,
    swrFn,
    swrOptions
  );

  return {
    swrKey,
    ...query,
  };
};

export type GetApiV1CirclesInfiniteQueryResult = NonNullable<
  Awaited<ReturnType<typeof getApiV1Circles>>
>;
export type GetApiV1CirclesInfiniteError = Error;

/**
 * 使用 SWR Infinite 取得 Circle 列表（支援無限捲動）
 * 對應 generated API: useGetApiV1CirclesInfinite
 * @summary 資源路由
 */
export const useGetApiV1CirclesInfinite = <TError = Error>(
  params?: CircleSearchParams,
  options?: {
    swr?: SWRInfiniteConfiguration<
      Awaited<ReturnType<typeof getApiV1Circles>>,
      TError
    > & { swrKeyLoader?: SWRInfiniteKeyLoader; enabled?: boolean };
  }
) => {
  const { swr: swrOptions } = options ?? {};

  const isEnabled = swrOptions?.enabled !== false;
  const swrKeyLoader =
    swrOptions?.swrKeyLoader ??
    (() => (isEnabled ? getGetApiV1CirclesInfiniteKeyLoader(params) : null));
  const swrFn = () => getApiV1Circles(params);

  const query = useSWRInfinite<Awaited<ReturnType<typeof swrFn>>, TError>(
    swrKeyLoader,
    swrFn,
    swrOptions
  );

  return {
    swrKeyLoader,
    ...query,
  };
};

export type GetApiV1CirclesQueryResult = NonNullable<
  Awaited<ReturnType<typeof getApiV1Circles>>
>;
export type GetApiV1CirclesQueryError = Error;

/**
 * 使用 SWR 取得 Circle 列表
 * 對應 generated API: useGetApiV1Circles
 * @summary 資源路由
 */
export const useGetApiV1Circles = <TError = Error>(
  params?: CircleSearchParams,
  options?: {
    swr?: SWRConfiguration<
      Awaited<ReturnType<typeof getApiV1Circles>>,
      TError
    > & { swrKey?: Key; enabled?: boolean };
  }
) => {
  const { swr: swrOptions } = options ?? {};

  const isEnabled = swrOptions?.enabled !== false;
  const swrKey =
    swrOptions?.swrKey ??
    (() => (isEnabled ? getGetApiV1CirclesKey(params) : null));
  const swrFn = () => getApiV1Circles(params);

  const query = useSWR<Awaited<ReturnType<typeof swrFn>>, TError>(
    swrKey,
    swrFn,
    swrOptions
  );

  return {
    swrKey,
    ...query,
  };
};

// Type exports for getApiV1CirclesId
export type GetApiV1CirclesIdQueryResult = NonNullable<
  Awaited<ReturnType<typeof getApiV1CirclesId>>
>;
export type GetApiV1CirclesIdQueryError = Error;
