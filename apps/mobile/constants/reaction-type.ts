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
  emoji: string;
  label: string;
}

export const REACTION_CONFIG: Record<ReactionTypeType, IReactionConfig> = {
  encourage: { emoji: "🥰", label: "一起加油" },
  touched: { emoji: "💓", label: "共鳴" },
  fire: { emoji: "🔥", label: "啟發" },
  useful: { emoji: "👍🏻", label: "加油" },
  sameHere: { emoji: "😳", label: "我也是" },
  curious: { emoji: "🧐", label: "好奇" },
};

/** The 4 reactions shown in the picker popup */
export const PICKER_REACTIONS: ReactionTypeType[] = ["useful", "fire", "touched", "curious"];
