import {
  getResourceData as getResourceDataService,
  getResourceListData as getResourceListDataService,
} from "@daodao/api";
import type { ResourceIdObject, ResourceSearchParams } from "../model";

/**
 * 統一的 Resource 資料獲取函數 (Server 端)
 */

/**
 * 獲取單一 Resource 資料
 */
export const getResourceData = async ({ resourceId }: ResourceIdObject) => {
  return getResourceDataService(resourceId);
};

/**
 * 獲取 Resource 列表資料
 */
export const getResourceListData = async (searchParams?: ResourceSearchParams) => {
  return getResourceListDataService({
    cursor: searchParams?.cursor ?? undefined,
  });
};

/**
 * 獲取 Resource 列表資料的 SWR Key
 * 用於在 Server Component 中生成 fallback key
 */
export const getResourceListDataKey = (searchParams?: ResourceSearchParams) => {
  return ["/api/v1/resources/", searchParams] as const;
};
