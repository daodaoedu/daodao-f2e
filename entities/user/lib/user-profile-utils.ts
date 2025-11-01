export interface UserIdObject {
  customId?: string | null;
  id: string;
}

/**
 * 解析用戶 ID，支持 @ 前綴的 customId 和普通的 userId
 */
export const parseUserId = (
  id: string
): UserIdObject => {
  const decodedId = decodeURIComponent(id);
  if (decodedId.startsWith('@')) {
    return { customId: decodedId.slice(1), id: '' };
  }
  return { id: decodedId };
};

/**
 * 格式化用戶 ID 用於 URL
 */
export const formatUserIdForUrl = ({ customId, id }: UserIdObject): string => {
  return customId ? `@${customId}` : id;
};

/**
 * 生成用戶資料頁面的基礎路徑
 * 使用 /users/ 路由，customId 使用 @ 前綴
 */
export const getUserProfileBasePath = (user: UserIdObject | null | undefined) => {
  if (!user) return '/'
  return `/users/${formatUserIdForUrl(user)}`;
};
