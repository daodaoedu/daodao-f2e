/**
 * 共同挑戰實踐由挑戰統一設定的欄位（隱私另由 practice-privacy-lock 處理）。
 * server 只看「有沒有送」、不比對值：送了原值也回 400（daodao#357）。
 */
export const CHALLENGE_LOCKED_FIELDS = ["title", "startDate", "durationDays"] as const;

export type ChallengeLockedField = (typeof CHALLENGE_LOCKED_FIELDS)[number];

/** 共同挑戰實踐的編輯送出內容：拿掉挑戰鎖定的欄位；非挑戰實踐原樣送出。 */
export const withoutChallengeLockedFields = <T extends object>(
  request: T,
  isChallenge: boolean
): T | Omit<T, ChallengeLockedField> => {
  if (!isChallenge) return request;
  const editable = { ...request } as Record<string, unknown>;
  for (const field of CHALLENGE_LOCKED_FIELDS) {
    delete editable[field];
  }
  return editable as Omit<T, ChallengeLockedField>;
};
