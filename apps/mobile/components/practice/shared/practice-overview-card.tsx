import { StyleSheet } from "react-native";
import { YStack, XStack, Text, View } from "tamagui";
import { Tag } from "@tamagui/lucide-icons";
import { colors } from "@/generated/design-tokens";
import type { ManualPracticeFormValues } from "../create/manual/schema";
import { CircularProgress } from "./circular-progress";

interface PracticeOverviewCardProps {
  actionDescription: ManualPracticeFormValues["actionDescription"];
  frequency: ManualPracticeFormValues["frequency"];
  durationMinutes: ManualPracticeFormValues["durationMinutes"];
  tags?: ManualPracticeFormValues["tags"];
  progress?: number;
  showProgress?: boolean;
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
}: PracticeOverviewCardProps) => {
  return (
    <View style={styles.card}>
      <YStack flex={1}>
        {/* Action Description */}
        <Text
          fontSize={14}
          fontWeight="500"
          color={colors.text.dark}
          marginBottom="$3"
          paddingRight={showProgress ? 80 : 0}
        >
          {actionDescription}
        </Text>

        {/* Time Commitments */}
        <XStack
          paddingBottom="$3"
          marginBottom="$3"
          borderBottomWidth={1}
          borderBottomColor={colors.basic["200"]}
        >
          <YStack width={80}>
            <Text fontSize={12} color={colors.text.dark}>
              一週
            </Text>
            <XStack alignItems="baseline" gap="$0.5">
              <Text fontSize={18} fontWeight="500" color={colors.primary.base}>
                {frequency}
              </Text>
              <Text fontSize={12} color={colors.text.dark}>
                天
              </Text>
            </XStack>
          </YStack>
          <YStack width={80}>
            <Text fontSize={12} color={colors.text.dark}>
              一次
            </Text>
            <XStack alignItems="baseline" gap="$0.5">
              <Text fontSize={18} fontWeight="500" color={colors.primary.base}>
                {durationMinutes}
              </Text>
              <Text fontSize={12} color={colors.text.dark}>
                分鐘
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: colors.basic.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.basic.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
