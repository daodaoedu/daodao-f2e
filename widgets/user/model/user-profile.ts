/**
 * 用戶資料頁面配置
 */
export const USER_PROFILE_TABS = [
  'profile',
  'projects',
  'practices',
  'ideas',
  'circles',
  'resources',
] as const;

export type UserProfileTab = (typeof USER_PROFILE_TABS)[number];

export const USER_PROFILE_TAB_TITLES: Record<UserProfileTab, string> = {
  profile: '的個人名片',
  projects: '的學習計劃',
  practices: '的主題實踐',
  ideas: '的想法',
  circles: '的揪團',
  resources: '的資源',
} as const;
