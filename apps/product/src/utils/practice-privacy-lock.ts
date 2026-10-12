/**
 * 編輯頁的隱私設定是否鎖定：共同挑戰由挑戰統一設定、燈塔本期實踐由教練統一設定。
 * 鎖定時不可送 privacyStatus，server 收到會回 400（daodao#278、#277 回報的「本期實踐存檔一律 400」）。
 */
export const isPracticePrivacyLocked = (
  practice: { isChallenge?: boolean; isCohortPrivacyLocked?: boolean } | undefined
): boolean => practice?.isChallenge === true || practice?.isCohortPrivacyLocked === true;

export const withEditablePrivacy = <T extends object>(
  request: T,
  privacyStatus: string,
  locked: boolean
): T | (T & { privacyStatus: string }) => (locked ? request : { ...request, privacyStatus });
