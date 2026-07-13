import { ChevronUp } from "@tamagui/lucide-icons";
import { useCallback, useMemo, useState } from "react";
import { LayoutAnimation, Platform, Pressable, UIManager } from "react-native";
import { Spinner, Text, View, XStack, YStack } from "tamagui";
import {
  type ApiMoodType,
  MOOD_EMOJI_SVG,
  MOOD_OPTIONS,
  type MoodType,
  mapApiMoodToMoodType,
} from "@/constants/mood";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import type { IMoodStat } from "../types";

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MAX_BAR_HEIGHT = 60;

interface ICheckInRecord {
  mood?: ApiMoodType;
}

interface ICheckInRecordCardProps {
  checkInsData?: { data?: ICheckInRecord[] };
  isLoading?: boolean;
}

/**
 * 打卡記錄卡片組件 (Mobile)
 * 顯示心情統計排行
 */
export const CheckInRecordCard = ({ checkInsData, isLoading = false }: ICheckInRecordCardProps) => {
  const t = useMobileTranslation("mobile.checkIn");
  const [isExpanded, setIsExpanded] = useState(true);

  // 從打卡記錄計算心情統計
  const moodStats: IMoodStat[] = useMemo(() => {
    if (!checkInsData?.data) {
      return MOOD_OPTIONS.map((option) => ({
        mood: option.id,
        count: 0,
      }));
    }

    // 初始化所有心情的計數為 0
    const moodCountMap = new Map<MoodType, number>();
    MOOD_OPTIONS.forEach((option) => {
      moodCountMap.set(option.id, 0);
    });

    // 統計每個心情的出現次數
    checkInsData.data.forEach((checkIn) => {
      const moodType = mapApiMoodToMoodType(checkIn.mood);
      if (moodType) {
        const currentCount = moodCountMap.get(moodType) ?? 0;
        moodCountMap.set(moodType, currentCount + 1);
      }
    });

    // 轉換為陣列格式
    return MOOD_OPTIONS.map((option) => ({
      mood: option.id,
      count: moodCountMap.get(option.id) ?? 0,
    }));
  }, [checkInsData]);

  const totalMoodCount = useMemo(
    () => moodStats.reduce((acc, curr) => acc + curr.count, 0),
    [moodStats]
  );

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  if (isLoading) {
    return (
      <YStack>
        <Text fontWeight="500" color={colors.text.dark} marginBottom="$3">
          {t("records_title")}
        </Text>
        <YStack
          backgroundColor={colors.basic.white}
          borderRadius="$md"
          paddingHorizontal="$4"
          paddingVertical="$2"
          alignItems="center"
          justifyContent="center"
          minHeight={80}
        >
          <Spinner color={colors.primary.base} />
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack>
      <Text fontWeight="500" color={colors.text.dark} marginBottom="$3">
        {t("records_title")}
      </Text>
      <YStack
        backgroundColor={colors.basic.white}
        borderRadius="$md"
        paddingHorizontal="$4"
        paddingVertical="$2"
      >
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between" marginBottom="$3">
          <Text fontSize={12} color={colors.text.dark} fontWeight="500">
            {t("mood_ranking")}
          </Text>
          <Pressable
            onPress={handleToggle}
            accessibilityLabel={isExpanded ? t("collapse") : t("expand")}
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View
              style={{
                transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
              }}
            >
              <ChevronUp size={18} color={colors.text.dark} />
            </View>
          </Pressable>
        </XStack>

        {/* Mood Ranking */}
        {isExpanded && (
          <XStack justifyContent="center" gap="$4" paddingBottom="$2">
            {MOOD_OPTIONS.map((moodOption, index) => {
              const stat = moodStats[index];
              const count = stat?.mood === moodOption.id ? stat.count : 0;
              const barHeight = totalMoodCount > 0 ? (count / totalMoodCount) * MAX_BAR_HEIGHT : 0;
              const MoodIcon = MOOD_EMOJI_SVG[moodOption.id];

              return (
                <YStack key={moodOption.id} alignItems="center" gap="$1">
                  {/* Bar */}
                  <View
                    width={6}
                    height={MAX_BAR_HEIGHT}
                    backgroundColor={colors.basic["200"]}
                    borderRadius={3}
                    overflow="hidden"
                    justifyContent="flex-end"
                  >
                    <View
                      width="100%"
                      height={barHeight}
                      backgroundColor={colors.primary.base}
                      borderRadius={3}
                    />
                  </View>
                  {/* Mood illustration (對齊 product 用 @daodao/assets 心情插畫) */}
                  <MoodIcon width={28} height={28} />
                  {/* Count */}
                  <Text
                    fontSize={12}
                    color={count > 0 ? colors.text.dark : colors.basic["400"]}
                    textAlign="center"
                  >
                    {count}
                  </Text>
                </YStack>
              );
            })}
          </XStack>
        )}
      </YStack>
    </YStack>
  );
};
