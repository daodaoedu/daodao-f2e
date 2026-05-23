import { Clock } from "@tamagui/lucide-icons";
import { StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import {
  EXECUTION_TIMING_OPTIONS,
  type ManualPracticeFormValuesType,
} from "../create/manual/schema";

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
  const t = useMobileTranslation("practice");

  return (
    <View style={styles.card}>
      <YStack>
        <Text fontSize={12} color={colors.text.dark} marginBottom="$2">
          {t("form_execution_timing")}
        </Text>
        <XStack flexWrap="wrap" gap="$2">
          {executionTiming.map((timing) => {
            const option = EXECUTION_TIMING_OPTIONS.find((opt) => opt.value === timing);
            if (!option) return null;
            return (
              <View key={timing} style={styles.badge}>
                <Clock size={16} color={colors.primary.base} />
                <Text fontSize={12} color={colors.text.dark}>
                  {t(option.labelKey)}
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
