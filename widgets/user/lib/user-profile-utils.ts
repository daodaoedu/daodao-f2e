import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserData } from '@/entities/user';
import type { UserIdentifierType, UserProfileTab } from '../model/user-profile';
import { USER_PROFILE_TABS, USER_PROFILE_TAB_TITLES } from '../model/user-profile';

/**
 * 生成用戶資料頁面的靜態參數
 */
export const generateUserProfileStaticParams = () => {
  return USER_PROFILE_TABS.map((tabKey) => ({
    slug: [tabKey],
  }));
};

/**
 * 生成用戶資料頁面的基礎路徑
 */
export const getUserProfileBasePath = (
  type: UserIdentifierType,
  id: string
) => {
  switch (type) {
    case 'userId':
      return `/users/${id}`;
    case 'customId':
      return `/me/${id}`;
    default:
      throw new Error(`Unsupported user identifier type: ${type}`);
  }
};

/**
 * 生成用戶資料頁面的元數據
 */
export const generateUserProfileMetadata = async (
  type: UserIdentifierType,
  id: string,
  slug?: string[]
): Promise<Metadata> => {
  const { data } = await getUserData(type, id);
  const tabKey = (slug?.[0] ?? 'profile') as UserProfileTab;
  const name = data?.name?.trim() ?? '未知用戶';

  // 檢查是否為有效的 tab
  if (!USER_PROFILE_TABS.includes(tabKey)) {
    const basePath = getUserProfileBasePath(type, id);
    return redirect(basePath);
  }

  const titleSuffix = USER_PROFILE_TAB_TITLES[tabKey];

  return {
    title: `${name}${titleSuffix}`,
  };
};

/**
 * 處理用戶資料頁面的 tab 內容渲染
 */
export const handleUserProfileTabContent = (
  type: UserIdentifierType,
  id: string,
  slug?: string[]
) => {
  const tabKey = (slug?.[0] ?? 'profile') as UserProfileTab;

  // 檢查是否為有效的 tab
  if (!USER_PROFILE_TABS.includes(tabKey)) {
    const basePath = getUserProfileBasePath(type, id);
    redirect(basePath);
  }

  return {
    tabKey,
    type,
    id,
  };
};
