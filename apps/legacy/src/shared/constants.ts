import getEnv from "@/shared/config/env";

const env = getEnv();

export const SOCIAL_LINKS = {
  FACEBOOK: "https://www.facebook.com/daodao.edu",
  INSTAGRAM: "https://www.instagram.com/daodao_edu",
  EMAIL: env.contactEmail,
} as const;

// 錨點 ID 常數 - 用於頁面內元素的 id 屬性
export const ANCHOR_IDS = {
  VISION: "vision",
  MISSION: "mission",
  SOLUTIONS: "solutions",
  FEATURES: "features",
  PLANS: "plans",
} as const;
