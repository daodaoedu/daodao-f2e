import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";
import { colors } from "@/generated/design-tokens";

interface ICheckInCardProps {
  taskTitle: string;
  date: string;
  mood: MoodType | null;
  content: string;
  tags: string[];
  images?: string[];
  titleColor?: string;
  onImagePress?: (index: number) => void;
}

/**
 * 打卡卡片組件 (Mobile)
 * 用於顯示打卡內容，包含時間戳、心情、文字、標籤和圖片
 */
export const CheckInCard = ({
  taskTitle,
  date,
  mood,
  content,
  tags,
  images,
  titleColor = colors.basic.white,
  onImagePress,
}: ICheckInCardProps) => {
  const moodOption = useMemo(
    () => (mood ? MOOD_OPTIONS.find((option) => option.id === mood) : null),
    [mood]
  );

  // 格式化日期
  const { dateYear, dateMonthDay } = useMemo(() => {
    const dateStr = date.replace(/\./g, "-");
    const dateObj = new Date(dateStr);

    if (!Number.isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear().toString();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return {
        dateYear: year,
        dateMonthDay: `${month}/${day}`,
      };
    }

    const parts = date.split(/[.-]/);
    return {
      dateYear: parts[0] || "",
      dateMonthDay: parts.slice(1).join("/") || "",
    };
  }, [date]);

  return (
    <YStack width={350} marginHorizontal="auto">
      {/* 實踐標題 */}
      <YStack paddingHorizontal="$2" paddingBottom="$5" alignItems="center">
        <Text
          fontSize={18}
          fontWeight="600"
          color={titleColor}
          textAlign="center"
          numberOfLines={2}
        >
          {taskTitle}
        </Text>
      </YStack>

      {/* 筆記本風格內容區 */}
      <YStack
        position="relative"
        backgroundColor={colors.basic.white}
        paddingBottom="$6"
        marginBottom="$5"
        marginTop="$5"
        borderBottomLeftRadius="$md"
        borderBottomRightRadius="$md"
      >
        {/* 筆記本裝訂線（頂部） */}
        <View
          position="absolute"
          top={-28}
          left={0}
          right={0}
          height={28}
          backgroundColor={colors.basic.white}
          borderTopLeftRadius="$md"
          borderTopRightRadius="$md"
        >
          <XStack position="absolute" bottom={0} left={16} right={16} justifyContent="space-around">
            {[...Array(5)].map((_, i) => (
              <View
                // biome-ignore lint/suspicious/noArrayIndexKey: 靜態裝飾元素，順序不會改變
                key={`binding-dot-${i}`}
                width={12}
                height={12}
                borderRadius={6}
                backgroundColor={colors.basic[200]}
              />
            ))}
          </XStack>
        </View>

        {/* 主要內容區 */}
        <YStack paddingTop="$4" paddingHorizontal="$5" maxHeight={460}>
          <YStack paddingBottom="$6" gap="$4">
            {/* 時間戳印章 */}
            <View
              position="absolute"
              top={16}
              right={16}
              width={80}
              height={80}
              borderRadius={40}
              borderWidth={3}
              borderColor={colors.primary.base}
              alignItems="center"
              justifyContent="center"
              style={{ transform: [{ rotate: "15deg" }] }}
            >
              <YStack alignItems="center">
                <Text fontSize={12} fontWeight="700" color={colors.primary.base}>
                  {dateYear}
                </Text>
                <Text fontSize={12} fontWeight="700" color={colors.primary.base}>
                  {dateMonthDay}
                </Text>
              </YStack>
            </View>

            {/* 心情狀態 */}
            {moodOption && (
              <XStack alignItems="center" gap="$2">
                <Text fontSize={24}>{moodOption.emoji}</Text>
                <Text fontSize={14} color={colors.text.dark}>
                  心情{moodOption.label}
                </Text>
              </XStack>
            )}

            {/* 文字內容 */}
            <Text
              fontSize={14}
              fontWeight="500"
              color={colors.text.dark}
              marginTop={moodOption ? 0 : "$8"}
              marginRight="$10"
            >
              {content}
            </Text>

            {/* 標籤 */}
            {tags && tags.length > 0 && (
              <XStack flexWrap="wrap" gap="$2">
                {tags.map((tag) => (
                  <Text key={tag} fontSize={14} color={colors.primary.base}>
                    # {tag}
                  </Text>
                ))}
              </XStack>
            )}

            {/* 圖片區域 */}
            {images && images.length > 0 && (
              <YStack gap="$3" marginTop="$4">
                <XStack flexWrap="wrap" gap="$2" justifyContent="center">
                  {images.slice(0, 3).map((imageUrl, index) => (
                    <View
                      key={imageUrl}
                      width={100}
                      height={100}
                      borderRadius="$sm"
                      overflow="hidden"
                      borderWidth={1}
                      borderColor={colors.basic[200]}
                      onPress={() => onImagePress?.(index)}
                      pressStyle={{ opacity: 0.8 }}
                      style={[
                        index === 0 && styles.imageFirst,
                        index === 1 && styles.imageSecond,
                        index === 2 && styles.imageThird,
                      ]}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        width="100%"
                        height="100%"
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </XStack>
              </YStack>
            )}
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
  imageFirst: {
    transform: [{ rotate: "-8deg" }],
    zIndex: 2,
  },
  imageSecond: {
    transform: [{ rotate: "12deg" }],
    zIndex: 1,
  },
  imageThird: {
    zIndex: 0,
  },
});
