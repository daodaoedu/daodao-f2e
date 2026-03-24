import { Clock } from "@tamagui/lucide-icons";
import { StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { EXECUTION_TIMING_OPTIONS, type ManualPracticeFormValuesType } from "../create/manual/schema";

interface ExecutionTimingCardProps {
  executionTiming: ManualPracticeFormValuesType["executionTiming"];
  customTiming?: ManualPracticeFormValuesType["customTiming"];
}

/**
 * 執行時機卡片組件 (Mobile)
 */
export const ExecutionTimingCard = ({
  executionTiming,
  customTiming,
}: ExecutionTimingCardProps) => {
  return (
    <View style={styles.card}>
      <YStack>
        <Text fontSize={12} color={colors.text.dark} marginBottom="$2">
          執行時機
        </Text>
        <XStack flexWrap="wrap" gap="$2">
          {executionTiming.map((timing) => {
            const option = EXECUTION_TIMING_OPTIONS.find((opt) => opt.value === timing);
            if (!option) return null;
            return (
              <View key={timing} style={styles.badge}>
                <Clock size={16} color={colors.primary.base} />
                <Text fontSize={12} color={colors.text.dark}>
                  {option.label}
                </Text>
              </View>
            );
          })}
          {customTiming && (
            <View style={styles.badge}>
              <Clock size={16} color={colors.primary.base} />
              <Text fontSize={12} color={colors.text.dark}>
                {customTiming}
              </Text>
            </View>
          )}
        </XStack>
      </YStack>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.lightCyan,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.background.veryLightBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
