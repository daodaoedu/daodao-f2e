/**
 * 用戶資料頁面配置
 */
export const USER_PROFILE_TABS = [
  'projects',
  'practices',
  'ideas',
  'circles',
  'resources',
] as const;

export type UserProfileTab = (typeof USER_PROFILE_TABS)[number];

export const DEFAULT_TAB = USER_PROFILE_TABS[0];
