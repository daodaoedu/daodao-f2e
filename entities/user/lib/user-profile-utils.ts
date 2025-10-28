import type { UserIdentifierType } from '../model/user-profile';

/**
 * 解析用戶 ID，支持 @ 前綴的 customId 和普通的 userId
 */
export const parseUserId = (
  id: string
): { type: UserIdentifierType; actualId: string } => {
  const decodedId = decodeURIComponent(id);
  if (decodedId.startsWith('@')) {
    return { type: 'customId', actualId: decodedId.slice(1) };
  }
  return { type: 'userId', actualId: decodedId };
};

/**
 * 格式化用戶 ID 用於 URL
 */
export const formatUserIdForUrl = (
  type: UserIdentifierType,
  id: string
): string => {
  return type === 'customId' ? `@${id}` : id;
};

/**
 * 生成用戶資料頁面的基礎路徑
 * 使用 /users/ 路由，customId 使用 @ 前綴
 */
export const getUserProfileBasePath = (
  type: UserIdentifierType,
  id: string
) => {
  const formattedId = formatUserIdForUrl(type, id);
  return `/users/${formattedId}`;
};
