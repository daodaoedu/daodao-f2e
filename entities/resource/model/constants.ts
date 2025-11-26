/**
 * Resource 相關類型定義和常數
 * 集中管理所有 Resource 相關的類型別名、枚舉和選項常數
 */

import type { OptionProps } from '@/shared/ui/option';
import type {
  ResourceSchema,
  ResourceListResponseSchema,
  ResourceDetailResponseSchema,
  ResourceFormSchema,
  ResourceSearchParamsSchema,
} from '@/services/resources/core/schema';

/**
 * Resource API 型別重新導出
 * 從 services 層提取 Resource 相關的型別
 */

export type Resource = ResourceSchema;

export type ResourceListResponse = ResourceListResponseSchema['data'];

export type ResourceDetail = ResourceDetailResponseSchema['data'];

export type ResourceForm = ResourceFormSchema;

export type ResourceSearchParams = ResourceSearchParamsSchema;

// ===== 業務相關類型 =====

/**
 * Resource ID 對象
 */
export interface ResourceIdObject {
  resourceId: string;
}

/**
 * Resource 類型枚舉
 */
export enum ResourceTypeEnum {
  Course = 'course',
  Book = 'book',
  Video = 'video',
  Website = 'website',
  Tool = 'tool',
  Other = 'other',
}

/**
 * Resource 等級枚舉
 */
export enum ResourceLevelEnum {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  All = 'all',
}

/**
 * Resource 費用類型枚舉
 */
export enum ResourceCostEnum {
  Free = 'free',
  Paid = 'paid',
  Freemium = 'freemium',
}

/**
 * Resource 排序選項
 */
export enum ResourceSortEnum {
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
  Rating = 'rating',
  ViewCount = 'viewCount',
}

/**
 * Resource 排序順序
 */
export enum ResourceOrderEnum {
  Desc = 'desc',
  Asc = 'asc',
}

// ===== 選項常數 =====

/**
 * Resource 類型選項
 */
export const RESOURCE_TYPE_OPTIONS: OptionProps<ResourceTypeEnum>[] = [
  { value: ResourceTypeEnum.Course, label: '課程' },
  { value: ResourceTypeEnum.Book, label: '書籍' },
  { value: ResourceTypeEnum.Video, label: '影片' },
  { value: ResourceTypeEnum.Website, label: '網站' },
  { value: ResourceTypeEnum.Tool, label: '工具' },
  { value: ResourceTypeEnum.Other, label: '其他' },
];

/**
 * Resource 等級選項
 */
export const RESOURCE_LEVEL_OPTIONS: OptionProps<ResourceLevelEnum>[] = [
  { value: ResourceLevelEnum.Beginner, label: '初級' },
  { value: ResourceLevelEnum.Intermediate, label: '中級' },
  { value: ResourceLevelEnum.Advanced, label: '高級' },
  { value: ResourceLevelEnum.All, label: '全部' },
];

/**
 * Resource 費用選項
 */
export const RESOURCE_COST_OPTIONS: OptionProps<ResourceCostEnum>[] = [
  { value: ResourceCostEnum.Free, label: '免費' },
  { value: ResourceCostEnum.Paid, label: '付費' },
  { value: ResourceCostEnum.Freemium, label: '免費增值' },
];

/**
 * Resource 排序選項
 */
export const RESOURCE_SORT_OPTIONS: OptionProps<ResourceSortEnum>[] = [
  { value: ResourceSortEnum.CreatedAt, label: '建立時間' },
  { value: ResourceSortEnum.UpdatedAt, label: '更新時間' },
  { value: ResourceSortEnum.Rating, label: '評分' },
  { value: ResourceSortEnum.ViewCount, label: '瀏覽次數' },
];

/**
 * Resource 排序順序選項
 */
export const RESOURCE_ORDER_OPTIONS: OptionProps<ResourceOrderEnum>[] = [
  { value: ResourceOrderEnum.Desc, label: '降序' },
  { value: ResourceOrderEnum.Asc, label: '升序' },
];

