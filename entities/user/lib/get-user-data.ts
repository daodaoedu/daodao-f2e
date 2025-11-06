import {
  getApiV1UsersId,
  getApiV1UsersCustomIdCustomId,
  getGetApiV1UsersIdKey,
  getGetApiV1UsersCustomIdCustomIdKey,
} from '@/generated/api/users.server';
import type { UserIdObject } from '../model';

/**
 * 統一的用戶資料獲取函數 (Server 端)
 */
export const getUserData = async ({ customId, id }: UserIdObject) => {
  if (customId) {
    return getApiV1UsersCustomIdCustomId(customId);
  }
  return getApiV1UsersId(id);
};

/**
 * 統一的用戶資料 SWR Key 獲取函數
 */
export const getUserDataKey = ({ customId, id }: UserIdObject) => {
  if (customId) {
    return getGetApiV1UsersCustomIdCustomIdKey(customId);
  }
  return getGetApiV1UsersIdKey(id);
};
