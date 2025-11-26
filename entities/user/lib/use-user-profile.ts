'use client';

import { useQuery } from '@/shared/api';
import type { UserIdObject } from '../model';

/**
 * 統一的用戶資料 Hook
 * 根據 UserIdObject 自動選擇使用 id 或 customId 來獲取用戶資料
 */
export const useUserProfile = (userIdObject: UserIdObject) => {
  const { customId, id } = userIdObject;

  const resultByUserId = useQuery(
    '/api/v1/users/{id}',
    { params: { path: { id } } },
    { revalidateOnMount: !customId }
  );

  const resultByCustomId = useQuery(
    '/api/v1/users/custom-id/{customId}',
    { params: { path: { customId: customId ?? '' } } },
    { revalidateOnMount: !!customId }
  );

  return customId ? resultByCustomId : resultByUserId;
};
