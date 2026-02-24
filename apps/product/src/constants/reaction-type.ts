// ============================================================================
// Quick Reaction Types & Config
// FRD: 快速回應與留言
// ============================================================================

export const ReactionType = {
  encourage: "encourage",   // 🧡 一起加油！
  learned: "learned",       // 💡 學到了！
  sameHere: "sameHere",     // 🙌 我也是！
  useful: "useful",         // 🛠️ 這好用！
  curious: "curious",       // 🧐 想知道...
} as const;

export type ReactionTypeType = (typeof ReactionType)[keyof typeof ReactionType];

export interface IReactionConfig {
  emoji: string;
  label: string;
  /** 點擊後留言框的 placeholder 引導文字 */
  placeholder: string;
}

export const REACTION_CONFIG: Record<ReactionTypeType, IReactionConfig> = {
  encourage: {
    emoji: "🧡",
    label: "一起加油！",
    placeholder: "看到你的進展真好，我很期待...",
  },
  learned: {
    emoji: "💡",
    label: "學到了！",
    placeholder: "這點對我很有啟發，特別是...",
  },
  sameHere: {
    emoji: "🙌",
    label: "我也是！",
    placeholder: "我也是！我上次遇到類似狀況是...",
  },
  useful: {
    emoji: "🛠️",
    label: "這好用！",
    placeholder: "這好實用！我會想要應用在...",
  },
  curious: {
    emoji: "🧐",
    label: "想知道...",
    placeholder: "這部分好有趣，想多請教關於...？",
  },
};

export const REACTION_TYPE_LIST = Object.keys(REACTION_CONFIG) as ReactionTypeType[];
