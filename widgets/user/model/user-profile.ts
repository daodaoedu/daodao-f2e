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

export const USER_PROFILE_TAB_TITLES: Record<UserProfileTab, string> = {
  projects: '學習計劃',
  practices: '主題實踐',
  ideas: '想法',
  circles: '發起揪團',
  resources: '分享資源',
} as const;

export type UserProfileTabTitle =
  (typeof USER_PROFILE_TAB_TITLES)[keyof typeof USER_PROFILE_TAB_TITLES];

export const DEFAULT_TAB: UserProfileTab = 'projects';
