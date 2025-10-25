// 導出 UI 組件
export * from './ui';

// 導出 hooks
export * from './lib/use-user-data';

// 導出用戶資料頁面相關
export type {
  UserIdentifierType,
  UserProfileTab,
  UserProfileTabConfig,
  UserProfilePageParams,
  UserProfileMetadata,
} from './model/user-profile';

export { USER_PROFILE_TABS, USER_PROFILE_TAB_TITLES } from './model/user-profile';

export {
  generateUserProfileStaticParams,
  generateUserProfileMetadata,
  handleUserProfileTabContent,
  getUserProfileBasePath,
} from './lib/user-profile-utils';
