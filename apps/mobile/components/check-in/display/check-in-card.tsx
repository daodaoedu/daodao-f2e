import NotebookHoleSvg from "@daodao/assets/images/dashboard/notebook-hole.svg";
import StampSvg from "@daodao/assets/images/dashboard/stamp.svg";
import { parseTextLinks } from "@daodao/shared/lib/parse-text-links";
import { useCallback, useMemo } from "react";
import { Linking, StyleSheet } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";
import { MOOD_EMOJI_SVG, MOOD_OPTIONS, type MoodType } from "@/constants/mood";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

/** 筆記本橫線顏色（對齊 product 的 #99ECFF，設計 token 無對應語意色） */
const NOTEBOOK_LINE_COLOR = "#99ECFF";

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
  const t = useMobileTranslation("mobile.checkIn");
  const moodOption = useMemo(
    () => (mood ? MOOD_OPTIONS.find((option) => option.id === mood) : null),
    [mood]
  );
  const MoodEmojiSvg = mood ? MOOD_EMOJI_SVG[mood] : null;
  const contentSegments = useMemo(() => parseTextLinks(content), [content]);

  const handleOpenLink = useCallback(async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  }, []);

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
        {/* 筆記本裝訂孔（頂部）— 對齊 product 的 NotebookHoleSvg */}
        <NotebookHoleSvg width={350} height={49} style={styles.notebookHole} />

        {/* 橫線紙紋（對齊 product 的 repeating linear-gradient） */}
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          overflow="hidden"
          pointerEvents="none"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: 靜態裝飾橫線，數量固定
              key={`rule-line-${i}`}
              position="absolute"
              top={62 + i * 39}
              left={15}
              right={20}
              height={1}
              backgroundColor={NOTEBOOK_LINE_COLOR}
            />
          ))}
        </View>

        {/* 主要內容區 */}
        <YStack paddingTop="$4" paddingHorizontal="$5" maxHeight={460}>
          <YStack paddingBottom="$6" gap="$4">
            {/* 時間戳印章 — 對齊 product 的 StampSvg（原生色 #536166 = logo-gray，白紙上免重上色） */}
            <View
              position="absolute"
              top={0}
              right={-8}
              width={100}
              height={100}
              pointerEvents="none"
            >
              <StampSvg width={100} height={100} />
              <View
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                alignItems="center"
                justifyContent="center"
              >
                <YStack alignItems="center" style={styles.stampDate}>
                  <Text fontSize={12} fontWeight="700" color={colors.logo.gray}>
                    {dateYear}
                  </Text>
                  <Text fontSize={12} fontWeight="700" color={colors.logo.gray}>
                    {dateMonthDay}
                  </Text>
                </YStack>
              </View>
            </View>

            {/* 心情狀態 */}
            {moodOption && (
              <XStack alignItems="center" gap="$2">
                {MoodEmojiSvg && <MoodEmojiSvg width={24} height={24} />}
                <Text fontSize={14} color={colors.text.dark}>
                  {t("mood_display", { mood: t(moodOption.labelKey) })}
                </Text>
              </XStack>
            )}

            {/* 文字內容 */}
            <Text
              fontSize={14}
              fontWeight="500"
              color={colors.text.dark}
              marginTop={moodOption ? 0 : "$8"}
              marginRight="$12"
            >
              {contentSegments.map((segment, index) =>
                segment.type === "url" ? (
                  <Text
                    key={`url-${index}-${segment.value}`}
                    color={colors.logo.cyan}
                    textDecorationLine="underline"
                    onPress={() => handleOpenLink(segment.value)}
                  >
                    {segment.value}
                  </Text>
                ) : (
                  // biome-ignore lint/suspicious/noArrayIndexKey: 純文字片段，順序不會變動
                  <Text key={`text-${index}`}>{segment.value}</Text>
                )
              )}
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
  notebookHole: {
    position: "absolute",
    top: -28,
    left: 0,
  },
  stampDate: {
    transform: [{ rotate: "15deg" }],
  },
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
