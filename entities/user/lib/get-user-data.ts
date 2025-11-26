import { getSwrKeyWithResponse } from '@/shared/api';
import type { UserIdObject } from '../model';

/**
 * 統一的用戶資料獲取函數 (Server 端)
 */
export const getUserData = async ({ customId, id }: UserIdObject) => {
  if (customId) {
    return getSwrKeyWithResponse('/api/v1/users/custom-id/{customId}', {
      params: { path: { customId } },
    });
  }
  return getSwrKeyWithResponse('/api/v1/users/{id}', {
    params: { path: { id } },
  });
};
