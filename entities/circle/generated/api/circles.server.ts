/**
 * Circle API - Server Side
 * 模擬 generated API 結構，未來可直接替換為 @generated/api/circles.server
 */

import type { Key } from 'swr';
import type {
  CircleValidatorsCircleDetailResponseSchema as CircleDetailResponse,
  CircleValidatorsCircleListResponseSchema as CircleListResponse,
  CircleValidatorsCircleFormSchema as CircleForm,
  CircleValidatorsCircleSearchParamsSchema as CircleSearchParams,
  CircleValidatorsCircleSchema as Circle,
} from '../models';
import getEnv from '@/shared/config/env';
// 未來替換為:
// import type {
//   CircleValidatorsCircleDetailResponseSchema as CircleDetailResponse,
//   CircleValidatorsCircleListResponseSchema as CircleListResponse,
//   CircleValidatorsCircleFormSchema as CircleForm,
//   CircleValidatorsCircleSearchParamsSchema as CircleSearchParams,
//   CircleValidatorsCircleSchema as Circle,
// } from '@/generated/models';

/**
 * 取得 base URL（支援開發和生產環境）
 */
const getBaseUrl = () => {
  if (getEnv().isDevelopment) {
    return 'http://localhost:5438';
  }
  return getEnv().stagingURL;
};

/**
 * 讀取 mock 資料（使用 fetch 從 public 資料夾讀取）
 */
const getMockData = async () => {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/data/circles-mock.json`, {
    cache: 'no-store', // 避免快取，確保開發時能看到最新資料
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch mock data: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * 取得單一 Circle 資料
 * 對應 generated API: getApiV1CirclesId
 */
export const getApiV1CirclesId = async (
  id: string
): Promise<CircleDetailResponse> => {
  const mockData = await getMockData();
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
  const mockData = await getMockData();

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
 * 建立 Circle
 * 對應 generated API: postApiV1Circles
 */
export const postApiV1Circles = async (_data: CircleForm): Promise<Circle> => {
  // TODO: 實作真實 API 呼叫
  throw new Error('Create API not implemented');
};

/**
 * 更新 Circle
 * 對應 generated API: putApiV1CirclesId
 */
export const putApiV1CirclesId = async (
  _id: string,
  _data: CircleForm
): Promise<Circle> => {
  // TODO: 實作真實 API 呼叫
  throw new Error('Update API not implemented');
};

/**
 * 刪除 Circle
 * 對應 generated API: deleteApiV1CirclesId
 */
export const deleteApiV1CirclesId = async (_id: string): Promise<void> => {
  // TODO: 實作真實 API 呼叫
  throw new Error('Delete API not implemented');
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
 * 取得建立 Circle 的 Mutation Key
 * 對應 generated API: getPostApiV1CirclesMutationKey
 */
export const getPostApiV1CirclesMutationKey = () => [`/api/v1/circles/`] as const;

/**
 * 取得更新 Circle 的 Mutation Key
 * 對應 generated API: getPutApiV1CirclesIdMutationKey
 */
export const getPutApiV1CirclesIdMutationKey = (id: string) =>
  [`/api/v1/circles/${id}`] as const;

/**
 * 取得刪除 Circle 的 Mutation Key
 * 對應 generated API: getDeleteApiV1CirclesIdMutationKey
 */
export const getDeleteApiV1CirclesIdMutationKey = (id: string) =>
  [`/api/v1/circles/${id}`] as const;

/**
 * Mutation Fetcher for POST
 * 對應 generated API: getPostApiV1CirclesMutationFetcher
 */
export const getPostApiV1CirclesMutationFetcher = () => {
  return (_: Key, { arg }: { arg: CircleForm }) => {
    return postApiV1Circles(arg);
  };
};

/**
 * Mutation Fetcher for PUT
 * 對應 generated API: getPutApiV1CirclesIdMutationFetcher
 */
export const getPutApiV1CirclesIdMutationFetcher = (id: string) => {
  return (_: Key, { arg }: { arg: CircleForm }) => {
    return putApiV1CirclesId(id, arg);
  };
};

/**
 * Mutation Fetcher for DELETE
 * 對應 generated API: getDeleteApiV1CirclesIdMutationFetcher
 */
export const getDeleteApiV1CirclesIdMutationFetcher = (id: string) => {
  return () => {
    return deleteApiV1CirclesId(id);
  };
};

// Type exports
export type GetApiV1CirclesIdQueryResult = NonNullable<
  Awaited<ReturnType<typeof getApiV1CirclesId>>
>;
export type GetApiV1CirclesIdQueryError = Error;

export type GetApiV1CirclesQueryResult = NonNullable<
  Awaited<ReturnType<typeof getApiV1Circles>>
>;
export type GetApiV1CirclesQueryError = Error;

export type PostApiV1CirclesMutationResult = NonNullable<
  Awaited<ReturnType<typeof postApiV1Circles>>
>;
export type PostApiV1CirclesMutationError = Error;

export type PutApiV1CirclesIdMutationResult = NonNullable<
  Awaited<ReturnType<typeof putApiV1CirclesId>>
>;
export type PutApiV1CirclesIdMutationError = Error;

export type DeleteApiV1CirclesIdMutationResult = NonNullable<
  Awaited<ReturnType<typeof deleteApiV1CirclesId>>
>;
export type DeleteApiV1CirclesIdMutationError = Error;

