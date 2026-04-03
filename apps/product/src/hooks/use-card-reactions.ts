"use client";

import type { BatchReactionItem, ReactionListItem, ReactionTargetType, ReactionTypeValue } from "@daodao/api";
import { removeReaction, upsertReaction, useReactions, useReactionsList } from "@daodao/api";
import { useCallback, useTransition } from "react";
import type { ReactionTypeType } from "@/constants/reaction-type";

export function useCardReactions(
  targetType: ReactionTargetType,
  targetId: string,
  prefetchedData?: BatchReactionItem,
  onMutate?: () => void
) {
  const hasBatch = !!prefetchedData;
  const { data: reactionsData, mutate } = useReactions(
    { targetType, targetId },
    { enabled: !hasBatch }
  );
  const { data: reactionsListData } = useReactionsList(
    { targetType, targetId },
    { enabled: !hasBatch }
  );
  const [, startTransition] = useTransition();

  const source = prefetchedData ?? reactionsData?.data;

  const currentUserReaction = (source?.currentUserReaction ?? null) as ReactionTypeType | null;
  const selectedReactions: ReactionTypeType[] = currentUserReaction ? [currentUserReaction] : [];
  const allReactions = source?.reactions ?? [];
  const totalCount = allReactions.reduce((sum, r) => sum + r.count, 0);
  const displayReactions = allReactions
    .filter((r) => r.count > 0)
    .map((r) => r.type as ReactionTypeType);

  const reactionItems: ReactionListItem[] =
    prefetchedData?.items ?? reactionsListData?.data?.items ?? [];
  const firstReactorName = reactionItems[0]?.name ?? undefined;

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
        onMutate?.();
      });
    },
    [currentUserReaction, targetType, targetId, mutate, onMutate]
  );

  return {
    selectedReactions,
    totalCount,
    displayReactions,
    handleToggle,
    reactionItems,
    firstReactorName,
  };
}
