/**
 * 推薦來源選項列表
 * 對應 API referralSource enum
 * value: 英文鍵值（傳送給後端）
 * label: 中文顯示名稱（前端顯示）
 */
export const REFERRAL_SOURCE_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "FB" },
  { value: "discord", label: "Discord" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "friend_referral", label: "朋友介紹" },
  { value: "others", label: "其他" },
] as const;

export type ReferralSourceValue = (typeof REFERRAL_SOURCE_OPTIONS)[number]["value"];
export type ReferralSourceLabel = (typeof REFERRAL_SOURCE_OPTIONS)[number]["label"];
