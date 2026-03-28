"use client";

import type { ReactionTypeValue } from "@daodao/api";
import { removeReaction, upsertReaction, useReactions } from "@daodao/api";
import { useCallback, useTransition } from "react";
import type { IReactionCount } from "@/components/check-in/reactions";
import { ReactionBar, ReactionPickerButton } from "@/components/check-in/reactions";
import type { ReactionTypeType } from "@/constants/reaction-type";

export interface ReactionSectionProps {
  /** 目標類型，目前支援 'practice' */
  targetType: "practice";
  /** 目標的外部 ID（UUID） */
  targetId: string;
  /** 反應變更回調（可選） */
  onReactionChange?: (type: ReactionTypeType | null) => void;
}

/**
 * 通用反應列元件（Quick Reactions）
 *
 * 顯示 ReactionPickerButton + ReactionBar，並直接呼叫 reactions API。
 * 與留言區完全分開，可獨立使用於任何支援 reactions 的目標。
 */
export function ReactionSection({ targetType, targetId, onReactionChange }: ReactionSectionProps) {
  const { data, mutate } = useReactions({ targetType, targetId });
  const [, startTransition] = useTransition();

  const reactions: IReactionCount[] = (data?.data?.reactions ?? []).map((r) => ({
    type: r.type as ReactionTypeType,
    count: r.count,
    latestActorName: r.latestActorName ?? undefined,
  }));

  const currentUserReaction = (data?.data?.currentUserReaction ?? null) as ReactionTypeType | null;
  const selectedReactions: ReactionTypeType[] = currentUserReaction ? [currentUserReaction] : [];

  const handleToggle = useCallback(
    (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;

      startTransition(async () => {
        if (isSelected) {
          await removeReaction({ targetType, targetId });
          onReactionChange?.(null);
        } else {
          await upsertReaction({
            targetType,
            targetId,
            reactionType: type as ReactionTypeValue,
          });
          onReactionChange?.(type);
        }
        await mutate();
      });
    },
    [currentUserReaction, targetType, targetId, mutate, onReactionChange]
  );

  return (
    <div className="flex items-center gap-3 border-t border-bg-gray pt-3 mt-3">
      <ReactionPickerButton
        selectedReactions={selectedReactions}
        onToggle={handleToggle}
        variant="card"
      />
      <ReactionBar
        reactions={reactions}
        selectedReactions={selectedReactions}
        onReactionClick={handleToggle}
        className="flex-wrap flex-1"
      />
    </div>
  );
}
