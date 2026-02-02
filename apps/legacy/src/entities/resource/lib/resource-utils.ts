import { parseToString } from "@/shared/lib/helper";
import type { ResourceIdObject } from "../model";

/**
 * 解析 Resource ID
 */
export const parseResourceId = (id: string): ResourceIdObject => {
  return { resourceId: parseToString(id) ?? "" };
};

/**
 * 格式化 Resource ID 用於 URL
 */
export const formatResourceIdForUrl = ({ resourceId }: ResourceIdObject): string => {
  return resourceId;
};

/**
 * 生成 Resource 詳情頁面的路徑
 */
export const getResourceDetailPath = (resource: ResourceIdObject | null | undefined) => {
  if (!resource) return "/resource";
  return `/resource/${formatResourceIdForUrl(resource)}`;
};

/**
 * 生成 Resource 編輯頁面的路徑
 */
export const getResourceEditPath = (resource: ResourceIdObject | null | undefined) => {
  if (!resource) return "/resource";
  return `/resource/${formatResourceIdForUrl(resource)}/edit`;
};

/**
 * 生成 Resource Review 創建頁面的路徑
 */
export const getResourceReviewCreatePath = (resource: ResourceIdObject | null | undefined) => {
  if (!resource) return "/resource";
  return `/resource/${formatResourceIdForUrl(resource)}/reviews/create`;
};

/**
 * 生成 Resource Review 編輯頁面的路徑
 */
export const getResourceReviewEditPath = (
  resource: ResourceIdObject | null | undefined,
  reviewId?: number | string | null
) => {
  if (!resource) return "/resource";
  if (!reviewId) return getResourceDetailPath(resource);
  return `/resource/${formatResourceIdForUrl(resource)}/reviews/${reviewId}/edit`;
};
