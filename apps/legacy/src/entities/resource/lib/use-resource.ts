"use client";

import { useResourceById, useResourceList as useResourceListService } from "@daodao/api";
import type { ResourceIdObject, ResourceSearchParams } from "../model";

/**
 * 統一的 Resource 資料 Hook
 * 根據 ResourceIdObject 來獲取 Resource 資料
 */
export const useResource = (resourceIdObject: ResourceIdObject | null) => {
  const { resourceId } = resourceIdObject || {};

  const result = useResourceById(resourceId ?? null);

  return {
    ...result,
    data: result.data?.data,
  };
};

/**
 * 獲取 Resource 列表的 Hook
 */
export const useResourceList = (searchParams?: ResourceSearchParams) => {
  return useResourceListService({
    cursor: searchParams?.cursor ?? undefined,
  });
};
