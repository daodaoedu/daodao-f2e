import { getSwrKeyWithResponse } from '@/shared/api';
import type { ProjectSearchParams } from '../model';

/**
 * 統一的 Project 資料獲取函數 (Server 端)
 */

/**
 * 獲取公開 Project 列表資料
 */
export const getPublicProjectListData = async () => {
  return getSwrKeyWithResponse('/api/v1/projects/public', {});
};

/**
 * 獲取公開 Project 列表資料的 SWR Key
 * 用於在 Server Component 中生成 fallback key
 */
export const getPublicProjectListDataKey = (
  searchParams?: ProjectSearchParams
) => {
  return [
    '/api/v1/projects/public',
    { ...searchParams, isPublic: true },
  ] as const;
};
