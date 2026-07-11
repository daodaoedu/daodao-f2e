export const ReactionType = {
  encourage: "encourage",
  touched: "touched",
  fire: "fire",
  useful: "useful",
  sameHere: "sameHere",
  curious: "curious",
} as const;

export type ReactionTypeType = (typeof ReactionType)[keyof typeof ReactionType];

export interface IReactionConfig {
  /** Lottie JSON URL (Google Noto Emoji)，對齊 product 用動態 Noto 表情 */
  lottieUrl: string;
  /** 備用靜態 emoji（Lottie 載入前的 fallback） */
  emoji: string;
  label: string;
}

export const REACTION_CONFIG: Record<ReactionTypeType, IReactionConfig> = {
  encourage: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/lottie.json",
    emoji: "🥰",
    label: "一起加油",
  },
  touched: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f493/lottie.json",
    emoji: "💓",
    label: "共鳴",
  },
  fire: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/lottie.json",
    emoji: "🔥",
    label: "啟發",
  },
  useful: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d_1f3fb/lottie.json",
    emoji: "👍🏻",
    label: "加油",
  },
  sameHere: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f633/lottie.json",
    emoji: "😳",
    label: "我也是",
  },
  curious: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f9d0/lottie.json",
    emoji: "🧐",
    label: "好奇",
  },
};

/** The 4 reactions shown in the picker popup */
export const PICKER_REACTIONS: ReactionTypeType[] = ["useful", "fire", "touched", "curious"];
