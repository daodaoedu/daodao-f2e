import BookSvg from "@daodao/assets/images/dashboard/book.svg";
import ClockSolidSvg from "@daodao/assets/images/icon/clock-solid.svg";
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
      <View style={{ position: "absolute", right: 0, bottom: 0, opacity: 0.7 }}>
        <BookSvg width={126} height={118} />
      </View>
      <YStack zIndex={1}>
        <Text fontSize={12} color={colors.text.dark} marginBottom="$2">
          {t("form_execution_timing")}
        </Text>
        <XStack flexWrap="wrap" gap="$2">
          {executionTiming.map((timing) => {
            const option = EXECUTION_TIMING_OPTIONS.find((opt) => opt.value === timing);
            if (!option) return null;
            return (
              <View key={timing} style={styles.badge}>
                <ClockSolidSvg width={18} height={18} color={colors.background.lightCyan} />
                <Text fontSize={14} color={colors.text.dark}>
                  {t(option.labelKey)}
                </Text>
              </View>
            );
          })}
          {customTiming && (
            <View style={styles.badge}>
              <ClockSolidSvg width={18} height={18} color={colors.background.lightCyan} />
              <Text fontSize={14} color={colors.text.dark}>
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
    position: "relative",
    overflow: "hidden",
    backgroundColor: colors.background.lightCyan,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
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
