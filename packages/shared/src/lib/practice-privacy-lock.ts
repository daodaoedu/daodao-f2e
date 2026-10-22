/**
 * 編輯頁的隱私設定是否鎖定：共同挑戰由挑戰統一設定、燈塔本期實踐由教練統一設定。
 * 鎖定時不可送 privacyStatus，server 收到會回 400（daodao#278、#277 網頁端；#333 App 端）。
 */
export const isPracticePrivacyLocked = (
  practice: { isChallenge?: boolean; isCohortPrivacyLocked?: boolean } | undefined
): boolean => practice?.isChallenge === true || practice?.isCohortPrivacyLocked === true;

export type PracticePrivacyStatus = "private" | "public" | "delayed";

const PRACTICE_PRIVACY_STATUSES: readonly string[] = ["private", "public", "delayed"];

/**
 * 從實踐詳情回應讀出原本的隱私。讀不到或值不認得時回 undefined，不要猜成 private：
 * 編輯頁拿預設值送出，會把公開實踐改成私人（daodao#358）。
 */
export const readPracticePrivacyStatus = (
  practice: { privacyStatus?: unknown } | undefined
): PracticePrivacyStatus | undefined => {
  const value = practice?.privacyStatus;
  return typeof value === "string" && PRACTICE_PRIVACY_STATUSES.includes(value)
    ? (value as PracticePrivacyStatus)
    : undefined;
};

/**
 * 只在隱私可編輯且已知時帶 privacyStatus。
 * privacyStatus 為 undefined（詳情沒讀到原本隱私、使用者也沒選）時不送，server 保留原值（daodao#358）。
 */
export const withEditablePrivacy = <T extends object>(
  request: T,
  privacyStatus: string | undefined,
  locked: boolean
): T | (T & { privacyStatus: string }) =>
  locked || privacyStatus === undefined ? request : { ...request, privacyStatus };
