/**
 * PracticeShowcaseCard
 *
 * Mobile 版靈感頁卡片，在 ShowcaseCard 基礎上新增：
 * - Haptic feedback（按反應時震動）
 * - Brewing overlay（延遲分享練習顯示醞釀中提示）
 * - onMenuPress callback
 */

import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";
import { Text, XStack } from "tamagui";
import { ShowcaseCard } from "@/components/home";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { removeReaction, upsertReaction } from "@/hooks/useReactions";
import type { IShowcasePractice } from "@/hooks/useShowcaseFeed";

interface PracticeShowcaseCardProps {
  practice: IShowcasePractice;
  onMenuPress?: (practice: IShowcasePractice) => void;
}

const brewingOverlay = (
  <XStack
    alignItems="center"
    gap="$2"
    paddingHorizontal="$3"
    paddingVertical="$2"
    borderRadius={12}
    backgroundColor="#F8F9FA"
    borderWidth={1}
    borderStyle="dashed"
    borderColor="#C1D0D8"
    marginBottom="$3"
  >
    <Text fontSize={16}>🍵</Text>
    <Text fontSize={12} color="rgba(0,0,0,0.6)">
      內容醞釀中，完成後解鎖！
    </Text>
  </XStack>
);

export function PracticeShowcaseCard({ practice, onMenuPress }: PracticeShowcaseCardProps) {
  const [currentUserReaction, setCurrentUserReaction] = useState<ReactionTypeType | null>(null);

  const handleReactionToggle = useCallback(
    async (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      setCurrentUserReaction(isSelected ? null : type);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      try {
        if (isSelected) {
          await removeReaction("practice", practice.id);
        } else {
          await upsertReaction("practice", practice.id, type);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch {
        setCurrentUserReaction(isSelected ? type : null);
      }
    },
    [currentUserReaction, practice.id],
  );

  return (
    <ShowcaseCard
      practice={practice}
      extraContent={practice.is_brewing ? brewingOverlay : undefined}
      selectedReaction={currentUserReaction}
      onReactionToggle={handleReactionToggle}
      onMenuPress={onMenuPress ? () => onMenuPress(practice) : undefined}
    />
  );
}
