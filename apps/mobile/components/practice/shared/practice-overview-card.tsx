import { Tag } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Avatar, Text, View, XStack, YStack } from "tamagui";
import { ReactionPickerButton } from "@/components/reactions/ReactionPickerButton";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { colors } from "@/generated/design-tokens";
import { removeReaction, upsertReaction, useReactions } from "@/hooks/useReactions";
import { useMobileTranslation } from "@/i18n";
import { runWithErrorAlert } from "@/utils/api-error";
import type { ManualPracticeFormValuesType } from "../create/manual/schema";
import { CircularProgress } from "./circular-progress";

interface CreatorInfo {
  id: string;
  name: string;
  photoURL?: string | null;
  customId?: string | null;
  date?: string;
}

interface PracticeOverviewCardProps {
  actionDescription: ManualPracticeFormValuesType["actionDescription"];
  frequency: ManualPracticeFormValuesType["frequency"];
  durationMinutes: ManualPracticeFormValuesType["durationMinutes"];
  tags?: ManualPracticeFormValuesType["tags"];
  progress?: number;
  showProgress?: boolean;
  // 公開頁面顯示建立者資訊
  creator?: CreatorInfo;
  // 快速反應（提供 practiceId 時顯示）
  practiceId?: string;
}

/**
 * 實踐概覽卡片組件 (Mobile)
 */
export const PracticeOverviewCard = ({
  actionDescription,
  frequency,
  durationMinutes,
  tags,
  progress,
  showProgress = false,
  creator,
  practiceId,
}: PracticeOverviewCardProps) => {
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");
  const router = useRouter();

  const {
    currentUserReaction,
    totalCount,
    displayReactions,
    mutate: mutateReactions,
  } = useReactions("practice", practiceId ?? "");

  const handleReactionToggle = useCallback(
    async (type: ReactionTypeType) => {
      if (!practiceId) return;
      await runWithErrorAlert(
        async () => {
          const isSelected = currentUserReaction === type;
          if (isSelected) {
            await removeReaction("practice", practiceId);
          } else {
            await upsertReaction("practice", practiceId, type);
          }
          await mutateReactions();
        },
        { title: commonT("errorTitle"), fallbackMessage: commonT("operationFailed") }
      );
    },
    [currentUserReaction, practiceId, mutateReactions, commonT]
  );

  const handlePressCreator = useCallback(() => {
    if (creator) {
      router.push(`/users/${creator.customId ?? creator.id}`);
    }
  }, [creator, router]);

  return (
    <View style={styles.card}>
      {/* 建立者資訊 - 僅在公開頁面顯示 */}
      {creator && (
        <Pressable onPress={handlePressCreator}>
          <XStack alignItems="center" gap="$2" marginBottom="$3">
            <Avatar circular size={32}>
              {creator.photoURL ? (
                <Avatar.Image source={{ uri: creator.photoURL }} />
              ) : (
                <Avatar.Fallback
                  backgroundColor={colors.background.veryLightGray}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={14} fontWeight="500" color={colors.text.dark}>
                    {creator.name.charAt(0)}
                  </Text>
                </Avatar.Fallback>
              )}
            </Avatar>
            <Text fontSize={14} fontWeight="500" color={colors.text.dark}>
              {creator.name}
            </Text>
            {creator.date && (
              <Text fontSize={14} color={colors.text.muted}>
                {creator.date}
              </Text>
            )}
          </XStack>
        </Pressable>
      )}
      <YStack flex={1}>
        {/* Action Description — product 固定 pr-[88px] 留給右上 compass / progress */}
        <Text
          fontSize={14}
          fontWeight="500"
          color={colors.text.dark}
          marginBottom="$3"
          paddingRight={showProgress ? 80 : 88}
        >
          {actionDescription}
        </Text>

        {/* Time Commitments — 對齊 product overview_per_week / overview_per_session */}
        <XStack
          paddingBottom="$3"
          marginBottom="$3"
          borderBottomWidth={1}
          borderBottomColor={colors.gray.light}
        >
          <YStack width={80}>
            <Text fontSize={12} color={colors.text.dark}>
              {t("overview_per_week")}
            </Text>
            <XStack alignItems="baseline" gap="$0.5">
              <Text fontSize={18} fontWeight="500" color={colors.logo.cyan}>
                {frequency}
              </Text>
              <Text fontSize={12} color={colors.text.dark}>
                {t("overview_days_unit")}
              </Text>
            </XStack>
          </YStack>
          <YStack width={80}>
            <Text fontSize={12} color={colors.text.dark}>
              {t("overview_per_session")}
            </Text>
            <XStack alignItems="baseline" gap="$0.5">
              <Text fontSize={18} fontWeight="500" color={colors.logo.cyan}>
                {durationMinutes}
              </Text>
              <Text fontSize={12} color={colors.text.dark}>
                {t("overview_minutes_unit")}
              </Text>
            </XStack>
          </YStack>
        </XStack>

        {/* Related Tags */}
        {tags && tags.length > 0 && (
          <XStack flexWrap="wrap" gap="$2">
            {tags.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Tag size={14} color={colors.primary.base} />
                <Text fontSize={12} color={colors.text.dark}>
                  {tag}
                </Text>
              </View>
            ))}
          </XStack>
        )}
      </YStack>

      {/* Circular Progress */}
      {showProgress && typeof progress === "number" && (
        <View style={styles.progressContainer}>
          <CircularProgress value={progress} />
        </View>
      )}

      {/* 反應列 */}
      {practiceId !== undefined && (
        <XStack
          borderTopWidth={1}
          borderTopColor={colors.basic["200"]}
          paddingTop="$3"
          marginTop="$3"
        >
          <ReactionPickerButton
            selectedReaction={currentUserReaction}
            onToggle={handleReactionToggle}
            variant="card"
            totalCount={totalCount}
            displayReactions={displayReactions}
          />
        </XStack>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: "relative",
    // 頁面改 very-light-gray 後，白卡自然浮起（對齊 product 白卡在灰底上）
    backgroundColor: colors.basic.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 0,
    shadowColor: colors.basic.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.background.veryLightBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  progressContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
});
