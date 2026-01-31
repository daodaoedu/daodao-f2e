/**
 * 社群媒體平台運行時常數
 */
export const SocialPlatform = {
  line: "line",
  facebook: "facebook",
  instagram: "instagram",
  threads: "threads",
  linkedin: "linkedin",
  discord: "discord",
} as const;

/**
 * 社群媒體平台類型
 */
export type SocialPlatform = (typeof SocialPlatform)[keyof typeof SocialPlatform];
