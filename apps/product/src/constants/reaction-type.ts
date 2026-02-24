// ============================================================================
// Quick Reaction Types & Config
// FRD: 快速回應與留言
// ============================================================================

export const ReactionType = {
  encourage: "encourage",   // 🥰 一起加油！
  touched:   "touched",     // 💓 很感動！
  fire:      "fire",        // 🔥 學到了！
  useful:    "useful",      // 👍 這好用！
  sameHere:  "sameHere",    // 😳 我也是！
  curious:   "curious",     // 🧐 想知道...
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
    label: "一起加油",
    placeholder: "看到你的進展真好，我很期待...",
  },
  touched: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f493/lottie.json",
    emoji: "💓",
    label: "很感動",
    placeholder: "你的故事讓我很感動，因為...",
  },
  fire: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/lottie.json",
    emoji: "🔥",
    label: "學到了",
    placeholder: "這點對我很有啟發，特別是...",
  },
  useful: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d_1f3fb/lottie.json",
    emoji: "👍",
    label: "這好用",
    placeholder: "這好實用！我會想要應用在...",
  },
  sameHere: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f633/lottie.json",
    emoji: "😳",
    label: "我也是",
    placeholder: "我也是！我上次遇到類似狀況是...",
  },
  curious: {
    lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f9d0/lottie.json",
    emoji: "🧐",
    label: "想知道...",
    placeholder: "這部分好有趣，想多請教關於...？",
  },
};

export const REACTION_TYPE_LIST = Object.keys(REACTION_CONFIG) as ReactionTypeType[];
