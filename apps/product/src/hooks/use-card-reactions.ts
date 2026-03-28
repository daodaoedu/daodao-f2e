"use client";

import type { ReactionTargetType, ReactionTypeValue } from "@daodao/api";
import { removeReaction, upsertReaction, useReactions } from "@daodao/api";
import { useCallback, useTransition } from "react";
import type { ReactionTypeType } from "@/constants/reaction-type";

export function useCardReactions(targetType: ReactionTargetType, targetId: string) {
  const { data: reactionsData, mutate } = useReactions({
    targetType,
    targetId,
  });
  const [, startTransition] = useTransition();

  const currentUserReaction = (reactionsData?.data?.currentUserReaction ??
    null) as ReactionTypeType | null;
  const selectedReactions: ReactionTypeType[] = currentUserReaction
    ? [currentUserReaction]
    : [];
  const allReactions = reactionsData?.data?.reactions ?? [];
  const totalCount = allReactions.reduce((sum, r) => sum + r.count, 0);
  const displayReactions = allReactions
    .filter((r) => r.count > 0)
    .map((r) => r.type as ReactionTypeType);

  const handleToggle = useCallback(
    (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      startTransition(async () => {
        if (isSelected) {
          await removeReaction({ targetType, targetId });
        } else {
          await upsertReaction({
            targetType,
            targetId,
            reactionType: type as ReactionTypeValue,
          });
        }
        await mutate();
      });
    },
    [currentUserReaction, targetType, targetId, mutate],
  );

  return {
    selectedReactions,
    totalCount,
    displayReactions,
    handleToggle,
  };
}
