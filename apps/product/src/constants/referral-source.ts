/**
 * 推薦來源選項列表
 * 對應 API referralSource enum
 * value: 英文鍵值（傳送給後端）
 * label: 中文顯示名稱（前端顯示）
 */
export const REFERRAL_SOURCE_OPTIONS = [
  { value: "instagram", label: "instagram" },
  { value: "facebook", label: "facebook" },
  { value: "discord", label: "discord" },
  { value: "linkedin", label: "linkedin" },
  { value: "friend_referral", label: "friend_referral" },
  { value: "others", label: "others" },
] as const;

export type ReferralSourceValue = (typeof REFERRAL_SOURCE_OPTIONS)[number]["value"];
export type ReferralSourceLabel = (typeof REFERRAL_SOURCE_OPTIONS)[number]["label"];
