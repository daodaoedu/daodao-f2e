import { 
  getApiV1UsersId, 
  getApiV1UsersCustomIdCustomId,
  getGetApiV1UsersIdKey,
  getGetApiV1UsersCustomIdCustomIdKey,
} from '@/generated/api/users.server';

export type UserIdentifierType = 'userId' | 'customId';

/**
 * 統一的用戶資料獲取函數
 */
export const getUserData = async (type: UserIdentifierType, id: string) => {
  switch (type) {
    case 'userId':
      return getApiV1UsersId(id);
    case 'customId':
      return getApiV1UsersCustomIdCustomId(id);
    default:
      throw new Error(`Unsupported user identifier type: ${type}`);
  }
};

/**
 * 統一的用戶資料 SWR Key 獲取函數
 */
export const getUserDataKey = (type: UserIdentifierType, id: string) => {
  
  switch (type) {
    case 'userId':
      return getGetApiV1UsersIdKey(id);
    case 'customId':
      return getGetApiV1UsersCustomIdCustomIdKey(id);
    default:
      throw new Error(`Unsupported user identifier type: ${type}`);
  }
};
