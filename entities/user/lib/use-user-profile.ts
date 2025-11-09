'use client';

import {
  useGetApiV1UsersId,
  useGetApiV1UsersCustomIdCustomId,
} from '@/generated/api/users.client';
import type { UserIdObject } from '../model';

/**
 * 統一的用戶資料 Hook
 * 根據 UserIdObject 自動選擇使用 id 或 customId 來獲取用戶資料
 */
export const useUserProfile = (userIdObject: UserIdObject) => {
  const { customId, id } = userIdObject;
  const resultByUserId = useGetApiV1UsersId(customId ? '' : id);
  const resultByCustomId = useGetApiV1UsersCustomIdCustomId(customId ?? '');

  return customId ? resultByCustomId : resultByUserId;
};
