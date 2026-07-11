import { ChevronLeft, Flame, Target, TrendingUp } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, Text, XStack, YStack } from "tamagui";
import { CheckInCalendar } from "@/components";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useCheckIns, usePractice } from "@/hooks/usePractices";
import { useMobileTranslation } from "@/i18n";

export default function PracticeCalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");
  const { practice, isLoading: isPracticeLoading } = usePractice(id);
  const { checkInDates, isLoading: isCheckInsLoading } = useCheckIns(id);

  const isLoading = isPracticeLoading || isCheckInsLoading;

  // 計算統計資料
  const stats = useMemo(() => {
    if (!practice) return null;

    const completionRate =
      practice.targetDays > 0
        ? Math.round((practice.completedDays / practice.targetDays) * 100)
        : 0;

    return {
      completedDays: practice.completedDays,
      targetDays: practice.targetDays,
      currentStreak: practice.currentStreak,
      longestStreak: practice.longestStreak,
      completionRate,
    };
  }, [practice]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    );
  }

  if (!practice) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Text fontSize={16} color="$color" opacity={0.6}>
            {t("mobile_practice_not_found")}
          </Text>
          <Button onPress={() => router.back()}>
            <Text>{commonT("back")}</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const cardColor = practice.color || colors.primary.base;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => router.back()}
            accessibilityLabel={commonT("back")}
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="600" color="$color">
              {t("mobile_calendar_title")}
            </Text>
            <Text fontSize={13} color="$color" opacity={0.6}>
              {practice.title}
            </Text>
          </YStack>
        </XStack>

        {/* Calendar */}
        <YStack paddingHorizontal="$4">
          <CheckInCalendar checkInDates={checkInDates} color={cardColor} />
        </YStack>

        {/* Stats */}
        {stats && (
          <YStack padding="$4" gap="$3">
            <Text fontSize={16} fontWeight="600" color="$color">
              {t("mobile_stats_title")}
            </Text>

            <XStack gap="$3">
              {/* Completion Rate */}
              <YStack
                flex={1}
                backgroundColor={colors.primary.palest}
                padding="$3"
                borderRadius="$md"
                alignItems="center"
                gap="$1"
              >
                <XStack alignItems="center" gap="$1">
                  <Target size={16} color={colors.primary.darker} />
                  <Text fontSize={20} fontWeight="700" color={colors.primary.darker}>
                    {stats.completionRate}%
                  </Text>
                </XStack>
                <Text fontSize={11} color={colors.primary.darker} opacity={0.8}>
                  {t("mobile_completion_rate")}
                </Text>
              </YStack>

              {/* Current Streak */}
              <YStack
                flex={1}
                backgroundColor={`${colors.semantic.warning}15`}
                padding="$3"
                borderRadius="$md"
                alignItems="center"
                gap="$1"
              >
                <XStack alignItems="center" gap="$1">
                  <Flame size={16} color={colors.semantic.warning} />
                  <Text fontSize={20} fontWeight="700" color={colors.semantic.warning}>
                    {stats.currentStreak}
                  </Text>
                </XStack>
                <Text fontSize={11} color={colors.semantic.warning}>
                  {t("mobile_current_streak")}
                </Text>
              </YStack>

              {/* Longest Streak */}
              <YStack
                flex={1}
                backgroundColor={`${colors.semantic.success}15`}
                padding="$3"
                borderRadius="$md"
                alignItems="center"
                gap="$1"
              >
                <XStack alignItems="center" gap="$1">
                  <TrendingUp size={16} color={colors.semantic.success} />
                  <Text fontSize={20} fontWeight="700" color={colors.semantic.success}>
                    {stats.longestStreak}
                  </Text>
                </XStack>
                <Text fontSize={11} color={colors.semantic.success}>
                  {t("mobile_longest_streak")}
                </Text>
              </YStack>
            </XStack>

            {/* Progress */}
            <YStack backgroundColor={colors.basic[100]} padding="$4" borderRadius="$md" gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="$color">
                  {t("mobile_progress")}
                </Text>
                <Text fontSize={14} fontWeight="600" color="$color">
                  {t("mobile_days_progress", {
                    completed: stats.completedDays,
                    total: stats.targetDays,
                  })}
                </Text>
              </XStack>
              <YStack
                height={8}
                backgroundColor={colors.basic[200]}
                borderRadius={4}
                overflow="hidden"
              >
                <YStack
                  height="100%"
                  width={`${stats.completionRate}%`}
                  backgroundColor={cardColor}
                  borderRadius={4}
                />
              </YStack>
            </YStack>
          </YStack>
        )}
      </YStack>
    </SafeAreaView>
  );
}
