import type { IReactionCountItem } from "@daodao/api";
import { format, isValid, parseISO } from "date-fns";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { PICKER_REACTIONS, REACTION_CONFIG } from "@/constants/reaction-type";

export const formatShowcaseDate = (dateStr?: string | null): string | null => {
  if (!dateStr) return null;
  const date = parseISO(dateStr);
  return isValid(date) ? format(date, "yyyy/MM/dd") : null;
};

export interface CheerDisplay {
  emojis: string[];
  displayText: string;
}

export const buildCheerDisplay = (reactions?: IReactionCountItem[]): CheerDisplay | null => {
  if (!reactions || reactions.length === 0) return null;

  const sorted = [...reactions].filter((r) => r.count > 0).sort((a, b) => b.count - a.count);
  if (sorted.length === 0) return null;

  const topTwo = sorted.slice(0, PICKER_REACTIONS.length);
  const emojis = topTwo.map((r) => {
    const config = REACTION_CONFIG[r.type as ReactionTypeType];
    return config?.emoji ?? "🔥";
  });

  const topReaction = sorted[0];
  const totalOthers = sorted.reduce((sum, r) => sum + r.count, 0) - (topReaction?.count ?? 0);
  const actorName = topReaction?.latestActorName;

  let displayText: string;
  if (actorName) {
    displayText = totalOthers > 0 ? `${actorName} 與其他 ${totalOthers} 人` : actorName;
  } else {
    const total = sorted.reduce((sum, r) => sum + r.count, 0);
    displayText = `${total} 人`;
  }

  return { emojis, displayText };
};
