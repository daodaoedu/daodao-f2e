// ============================================================================
// Quick Reaction Types & Config
// FRD: 快速回應與留言
// ============================================================================

export const ReactionType = {
  encourage: "encourage", // 🥰 一起加油！
  touched: "touched", // 💓 很感動！
  fire: "fire", // 🔥 學到了！
  useful: "useful", // 👍 這好用！
  sameHere: "sameHere", // 😳 我也是！
  curious: "curious", // 🧐 想知道...
} as const;

export type ReactionTypeType = (typeof ReactionType)[keyof typeof ReactionType];

export interface IReactionConfig {
  /** Lottie JSON URL (Google Noto Emoji) */
  lottieUrl: string;
  /** 備用靜態 emoji（Lottie 載入前或 SSR） */
  emoji: string;
  label: string;
  /** 點擊後留言框的 placeholder 引導文字 */
  placeholder: string;
}

export const REACTION_CONFIG: Record<ReactionTypeType, IReactionConfig> = {
  encourage: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/lottie.json",
    emoji: "🥰",
    label: "reaction_label_encourage",
    placeholder: "reaction_placeholder_encourage",
  },
  touched: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f493/lottie.json",
    emoji: "💓",
    label: "reaction_label_touched",
    placeholder: "reaction_placeholder_touched",
  },
  fire: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/lottie.json",
    emoji: "🔥",
    label: "reaction_label_fire",
    placeholder: "reaction_placeholder_fire",
  },
  useful: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d_1f3fb/lottie.json",
    emoji: "👍🏻",
    label: "reaction_label_useful",
    placeholder: "reaction_placeholder_useful",
  },
  sameHere: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f633/lottie.json",
    emoji: "😳",
    label: "reaction_label_sameHere",
    placeholder: "reaction_placeholder_sameHere",
  },
  curious: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f9d0/lottie.json",
    emoji: "🧐",
    label: "reaction_label_curious",
    placeholder: "reaction_placeholder_curious",
  },
};

export const REACTION_TYPE_LIST = Object.keys(REACTION_CONFIG) as ReactionTypeType[];

/** Picker 可選的 reaction 子集（決定顯示上限） */
export const PICKER_REACTIONS: ReactionTypeType[] = ["useful", "fire", "touched", "curious"];
