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
 * 執行時機卡片 — 對齊 product execution-timing-card
 * bg-light-cyan + 右下書本插圖（固定 clip，不裁切 badge 文字）
 */
export const ExecutionTimingCard = ({
  executionTiming,
  customTiming,
}: ExecutionTimingCardProps) => {
  const t = useMobileTranslation("practice");
  const timings = executionTiming ?? [];

  return (
    <View style={styles.card}>
      {/* 書本裝飾：固定右下，opacity 0.7 */}
      <View style={styles.bookClip} pointerEvents="none">
        <BookSvg width={100} height={94} />
      </View>

      <YStack style={styles.content} gap={8}>
        <Text fontSize={12} color={colors.text.dark}>
          {t("form_execution_timing")}
        </Text>
        {timings.length === 0 && !customTiming ? (
          <Text fontSize={12} color={colors.text.muted}>
            —
          </Text>
        ) : (
          <XStack flexWrap="wrap" gap={6}>
            {timings.map((timing) => {
              const option = EXECUTION_TIMING_OPTIONS.find((opt) => opt.value === timing);
              if (!option) return null;
              return (
                <View key={timing} style={styles.badge}>
                  <ClockSolidSvg width={16} height={16} color={colors.logo.cyan} />
                  <Text fontSize={12} color={colors.text.dark} numberOfLines={1}>
                    {t(option.labelKey)}
                  </Text>
                </View>
              );
            })}
            {customTiming ? (
              <View style={styles.badge}>
                <ClockSolidSvg width={16} height={16} color={colors.logo.cyan} />
                <Text fontSize={12} color={colors.text.dark} numberOfLines={1}>
                  {customTiming}
                </Text>
              </View>
            ) : null}
          </XStack>
        )}
      </YStack>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: "relative",
    // 不對整卡 overflow:hidden，避免 badge 被切；書本用獨立 clip
    minHeight: 128,
    backgroundColor: colors.background.lightCyan,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    // 右側留白給書本
    paddingRight: 56,
  },
  bookClip: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 72,
    height: 68,
    overflow: "hidden",
    opacity: 0.75,
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.background.veryLightBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    maxWidth: "100%",
  },
});
