import { useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import type { ManualPracticeFormValuesType } from "../create/manual/schema";

// Date utilities
const parseDate = (dateStr: string): Date | null => {
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const differenceInDays = (later: Date, earlier: Date): number => {
  const diffTime = later.getTime() - earlier.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

interface ExecutionDurationCardProps {
  durationDays: ManualPracticeFormValuesType["durationDays"] | number;
  startDate: ManualPracticeFormValuesType["startDate"] | string | null;
  showRemaining?: boolean;
}

/**
 * 執行時長卡片組件 (Mobile)
 */
export const ExecutionDurationCard = ({
  durationDays,
  startDate,
  showRemaining = false,
}: ExecutionDurationCardProps) => {
  const t = useMobileTranslation("practice");
  const { days, start, end, remainingDays } = useMemo(() => {
    const d = typeof durationDays === "string" ? Number.parseInt(durationDays, 10) : durationDays;
    const today = new Date();
    const s = startDate ? parseDate(startDate) : null;
    const e = s ? addDays(s, d) : null;
    const r = showRemaining && e ? Math.min(d, Math.max(0, differenceInDays(e, today))) : d;

    return { days: d, start: s, end: e, remainingDays: r };
  }, [durationDays, startDate, showRemaining]);

  const formatDate = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  }, []);

  return (
    <View style={styles.card}>
      {showRemaining ? (
        <YStack>
          <Text fontSize={12} color={colors.text.dark}>
            {t("remaining_label")}
          </Text>
          <XStack alignItems="baseline" gap="$0.5">
            <Text fontSize={18} fontWeight="500" color={colors.logo.orange}>
              {remainingDays}
            </Text>
            <Text fontSize={12} color={colors.text.dark}>
              {t("frequency_unit")}
            </Text>
            <Text fontSize={12} color={colors.text.dark}>
              {t("total_prefix")}
            </Text>
            <Text fontSize={12} color={colors.text.dark}>
              {days}
            </Text>
            <Text fontSize={12} color={colors.text.dark}>
              {t("frequency_unit")}
            </Text>
          </XStack>
        </YStack>
      ) : (
        <YStack>
          <Text fontSize={12} color={colors.text.dark}>
            {t("execution_duration_label")}
          </Text>
          <XStack alignItems="baseline" gap="$0.5">
            <Text fontSize={18} fontWeight="500" color={colors.logo.orange}>
              {durationDays}
            </Text>
            <Text fontSize={12} color={colors.text.dark}>
              {t("frequency_unit")}
            </Text>
          </XStack>
        </YStack>
      )}
      {start && (
        <YStack marginTop="$2">
          <Text fontSize={12} color={colors.text.dark}>
            {t("start_date_label")}
          </Text>
          <Text fontSize={14} color={colors.primary.base}>
            {formatDate(start)}
          </Text>
        </YStack>
      )}
      {end && (
        <YStack marginTop="$2">
          <Text fontSize={12} color={colors.text.dark}>
            {t("end_date_label")}
          </Text>
          <Text fontSize={14} color={colors.primary.base}>
            {formatDate(end)}
          </Text>
        </YStack>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: colors.background.veryLightBlue,
    borderRadius: 8,
    padding: 16,
    minHeight: 120,
  },
});
