import CircleSvg from "@daodao/assets/images/dashboard/circle.svg";
import ClippedCircleSvg from "@daodao/assets/images/dashboard/clipped-circle.svg";
import HexagonSvg from "@daodao/assets/images/dashboard/hexagon.svg";
import SemiCircleSvg from "@daodao/assets/images/dashboard/semi-circle.svg";
import SpeechBubbleSvg from "@daodao/assets/images/dashboard/speech-bubble.svg";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text, View, YStack } from "tamagui";
import { type ApiMoodType, MOOD_EMOJI_SVG, MoodType, mapApiMoodToMoodType } from "@/constants/mood";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import type { ICheckInItem } from "../types";

/**
 * 形狀資產（對齊 product 的 dashboard 形狀，含各自配色）。
 * 順序＝circle(綠) / hexagon(藍) / semi-circle(黃) / speech-bubble(橘) / clipped-circle(深橘)。
 * width/height 取自 SVG viewBox，用於等比縮放。
 */
const SHAPE_CONFIGS = [
  { Component: CircleSvg, width: 212, height: 212 },
  { Component: HexagonSvg, width: 197, height: 225 },
  { Component: SemiCircleSvg, width: 268, height: 138 },
  { Component: SpeechBubbleSvg, width: 260, height: 175 },
  { Component: ClippedCircleSvg, width: 212, height: 211 },
] as const;

// speech-bubble 的內容要往上抬，避開底部的對話尾巴（對齊 product 的 pb-11 處理）
const SPEECH_BUBBLE_INDEX = 3;

// 每張卡的旋轉角度（限制 -20~20，給堆疊自然感，對齊 product 的角度限制）
const ROTATIONS = [-8, 6, -5, 9, -4, 7, -10, 5] as const;

// 形狀基準寬（其餘依 viewBox 比例縮放）
const SHAPE_WIDTH = 160;

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
 * 將 API 的 checkinDate（2024-01-20）轉為顯示格式（2024.01.20）
 */
const formatCheckInDate = (checkinDate: string): string => checkinDate.replace(/-/g, ".");

/**
 * 打卡堆疊組件 (Mobile)
 * 對齊 product：以 @daodao/assets 的彩色形狀 + 心情插畫堆疊呈現打卡記錄。
 * （product 用 Matter.js 物理落下；RN 無對應 DOM 幾何 API，改用左右交錯 + 旋轉 + 重疊的靜態堆疊近似其落定樣貌。）
 */
export const CheckInStack = ({ checkInsData, onCheckInPress }: ICheckInStackProps) => {
  const t = useMobileTranslation("mobile.checkInList");

  const items: ICheckInItem[] = useMemo(() => {
    if (!checkInsData?.data) {
      return [];
    }
    return checkInsData.data.map((checkIn) => ({
      id: String(checkIn.id),
      date: formatCheckInDate(checkIn.checkinDate),
      // NULL mood fallback 到 neutral，避免整筆被隱藏（對齊 product）
      mood: mapApiMoodToMoodType(checkIn.mood) ?? MoodType.neutral,
      content: checkIn.note || "",
    }));
  }, [checkInsData]);

  const handlePress = useCallback(
    (itemId: string) => {
      onCheckInPress?.(itemId);
    },
    [onCheckInPress]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const shapeIndex = index % SHAPE_CONFIGS.length;
        const shape = SHAPE_CONFIGS[shapeIndex] ?? SHAPE_CONFIGS[0];
        const ShapeComponent = shape.Component;
        const width = SHAPE_WIDTH;
        const height = Math.round((SHAPE_WIDTH * shape.height) / shape.width);
        const rotation = ROTATIONS[index % ROTATIONS.length];
        const isLeft = index % 2 === 0;
        const MoodIcon = MOOD_EMOJI_SVG[item.mood];
        const contentPaddingBottom = shapeIndex === SPEECH_BUBBLE_INDEX ? Math.round(height * 0.28) : 0;

        return (
          <Pressable
            key={item.id}
            onPress={() => handlePress(item.id)}
            style={({ pressed }) => [
              styles.item,
              {
                width,
                height,
                alignSelf: isLeft ? "flex-start" : "flex-end",
                marginTop: index === 0 ? 0 : Math.round(-height * 0.22),
                transform: [{ rotate: `${rotation}deg` }],
              },
              pressed && styles.itemPressed,
            ]}
            accessibilityLabel={t("stack_accessibility", { number: index + 1, date: item.date })}
            accessibilityRole="button"
          >
            <ShapeComponent width={width} height={height} />
            <YStack style={[styles.itemContent, { paddingBottom: contentPaddingBottom }]}>
              <MoodIcon width={30} height={30} />
              <Text fontSize={12} color={colors.text.dark} fontWeight="500">
                {item.date}
              </Text>
              {item.content ? (
                <Text
                  fontSize={12}
                  color={colors.text.dark}
                  numberOfLines={2}
                  textAlign="center"
                  paddingHorizontal="$3"
                >
                  {item.content}
                </Text>
              ) : null}
            </YStack>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 8,
  },
  item: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  itemPressed: {
    opacity: 0.85,
  },
});
