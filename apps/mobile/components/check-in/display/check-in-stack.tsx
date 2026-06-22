import { useCallback, useMemo } from "react";
import { FlatList, type ListRenderItemInfo, Pressable, StyleSheet } from "react-native";
import { Text, View, YStack } from "tamagui";
import { type ApiMoodType, MOOD_OPTIONS, mapApiMoodToMoodType } from "@/constants/mood";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import type { ICheckInItem } from "../types";

// Shape colors for visual variety
const SHAPE_COLORS = [
  colors.practice.green,
  colors.practice.blue,
  colors.semantic.error,
  colors.logo.yellow,
  colors.logo.orange,
] as const;

interface ICheckInData {
  id: number;
  checkinDate: string;
  mood?: ApiMoodType;
  note?: string;
}

interface ICheckInsResponse {
  data?: ICheckInData[];
}

interface ICheckInStackProps {
  checkInsData?: ICheckInsResponse;
  onCheckInPress?: (checkInId: string) => void;
}

/**
 * 將 API 的 checkinDate 格式轉換為顯示格式
 * 從 "2024-01-20" 轉換為 "2024.01.20"
 */
const formatCheckInDate = (checkinDate: string): string => {
  return checkinDate.replace(/-/g, ".");
};

/**
 * 打卡堆疊組件 (Mobile)
 * 用於顯示多個打卡記錄，以卡片列表形式呈現
 */
export const CheckInStack = ({ checkInsData, onCheckInPress }: ICheckInStackProps) => {
  const t = useMobileTranslation("mobile.checkInList");
  // 將 API 資料轉換為 ICheckInItem[] 格式
  const items: ICheckInItem[] = useMemo(() => {
    if (!checkInsData?.data) {
      return [];
    }

    return checkInsData.data
      .map((checkIn) => {
        const moodType = mapApiMoodToMoodType(checkIn.mood);
        // 如果沒有心情類型，跳過這個打卡記錄
        if (!moodType) {
          return null;
        }

        return {
          id: String(checkIn.id),
          date: formatCheckInDate(checkIn.checkinDate),
          mood: moodType,
          content: checkIn.note || "",
        };
      })
      .filter((item): item is ICheckInItem => item !== null);
  }, [checkInsData]);

  const handlePress = useCallback(
    (itemId: string) => {
      onCheckInPress?.(itemId);
    },
    [onCheckInPress]
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ICheckInItem>) => {
      const shapeColor = SHAPE_COLORS[index % SHAPE_COLORS.length];
      const moodOption = MOOD_OPTIONS.find((option) => option.id === item.mood);

      return (
        <Pressable
          onPress={() => handlePress(item.id)}
          style={({ pressed }) => [
            styles.itemContainer,
            { backgroundColor: shapeColor },
            pressed && styles.itemPressed,
          ]}
          accessibilityLabel={t("stack_accessibility", { number: index + 1, date: item.date })}
          accessibilityRole="button"
        >
          <YStack flex={1} gap="$2" alignItems="center" justifyContent="center">
            {/* Emoji */}
            {moodOption && <Text fontSize={28}>{moodOption.emoji}</Text>}

            {/* Date */}
            <Text fontSize={12} color={colors.text.dark} fontWeight="500">
              {item.date}
            </Text>

            {/* Content preview */}
            {item.content && (
              <Text
                fontSize={12}
                color={colors.text.dark}
                numberOfLines={2}
                textAlign="center"
                paddingHorizontal="$2"
              >
                {item.content}
              </Text>
            )}
          </YStack>
        </Pressable>
      );
    },
    [handlePress, t]
  );

  const keyExtractor = useCallback((item: ICheckInItem) => item.id, []);

  // 如果沒有資料，不顯示任何內容
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  listContent: {
    paddingVertical: 8,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  itemContainer: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    shadowColor: colors.basic.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
