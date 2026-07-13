import NotebookHoleSvg from "@daodao/assets/images/dashboard/notebook-hole.svg";
import StampSvg from "@daodao/assets/images/dashboard/stamp.svg";
import TapeSvg from "@daodao/assets/images/dashboard/tape.svg";
import { parseTextLinks } from "@daodao/shared/lib/parse-text-links";
import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import {
  Linking,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
} from "react-native";
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
  /** 標題下方插入的額外內容（例如同日打卡切換導航） */
  afterTitle?: ReactNode;
  /** 卡片底部互動區（reaction + 留言按鈕），渲染於筆記本卡片內、含上分隔線 */
  bottomActions?: ReactNode;
  /** 內容區改為固定高度內捲動 + 底部漸層遮罩（對齊 product 的 max-h + fade），用於詳情頁 */
  scrollable?: boolean;
  /** 內容空白時顯示提示文字（僅本人打卡才顯示，對齊 product 的 showEmptyHint） */
  showEmptyHint?: boolean;
}

/** 內容區內捲動的最大高度（對齊 product 的 max-h-[400px]） */
const CONTENT_MAX_HEIGHT = 420;
/** 底部漸層遮罩高度 */
const BOTTOM_FADE_HEIGHT = 80;

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
  afterTitle,
  bottomActions,
  scrollable = false,
  showEmptyHint = false,
}: ICheckInCardProps) => {
  const t = useMobileTranslation("mobile.checkIn");
  const isBlankContent = !content || content.trim().length === 0;

  // 內容內捲動時，未捲到底部就顯示底部漸層遮罩（對齊 product）
  const [showBottomFade, setShowBottomFade] = useState(false);
  const viewHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const offsetYRef = useRef(0);
  const recomputeFade = useCallback(() => {
    setShowBottomFade(contentHeightRef.current - offsetYRef.current - viewHeightRef.current > 4);
  }, []);
  const handleContentScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      offsetYRef.current = contentOffset.y;
      viewHeightRef.current = layoutMeasurement.height;
      contentHeightRef.current = contentSize.height;
      recomputeFade();
    },
    [recomputeFade]
  );
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

  const contentBody = (
    <YStack paddingBottom="$6" gap="$4">
      {/* 時間戳印章 — 對齊 product 的 StampSvg（原生色 #536166 = logo-gray，白紙上免重上色） */}
      <View position="absolute" top={0} right={-8} width={100} height={100} pointerEvents="none">
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

      {/* 文字內容（空白且為本人時顯示提示，對齊 product） */}
      {isBlankContent && showEmptyHint ? (
        <Text
          fontSize={14}
          fontStyle="italic"
          color={colors.gray.mid}
          marginTop={moodOption ? 0 : "$8"}
          marginRight="$12"
        >
          {t("empty_content_hint")}
        </Text>
      ) : (
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
      )}

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

      {/* 圖片區域：散置拍立得 + 膠帶，對齊 product */}
      {images && images.length > 0 && (
        <View style={styles.imageScatter}>
          {images.slice(0, 3).map((imageUrl, index) => (
            <View
              key={imageUrl}
              onPress={() => onImagePress?.(index)}
              pressStyle={{ opacity: 0.85 }}
              style={[
                styles.polaroid,
                index === 0 && styles.polaroid0,
                index === 1 && styles.polaroid1,
                index === 2 && styles.polaroid2,
              ]}
            >
              <View style={styles.polaroidClip}>
                <Image source={{ uri: imageUrl }} width="100%" height="100%" resizeMode="cover" />
              </View>
              {index === 0 && <TapeSvg width={70} height={38} style={styles.tape} />}
            </View>
          ))}
        </View>
      )}
    </YStack>
  );

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

      {/* 標題下方額外內容（如同日打卡切換導航） */}
      {afterTitle}

      {/* 筆記本風格內容區 */}
      <YStack
        position="relative"
        backgroundColor={colors.basic.white}
        paddingBottom={bottomActions ? 0 : "$6"}
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

        {/* 主要內容區：scrollable 時固定高度內捲動 + 底部漸層；否則直接展開 */}
        {scrollable ? (
          <View position="relative">
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              nestedScrollEnabled
              onScroll={handleContentScroll}
              onLayout={(e) => {
                viewHeightRef.current = e.nativeEvent.layout.height;
                recomputeFade();
              }}
              onContentSizeChange={(_, h) => {
                contentHeightRef.current = h;
                recomputeFade();
              }}
            >
              {contentBody}
            </ScrollView>
            {/* 底部漸層遮罩（未捲到底時顯示），對齊 product 的 fade */}
            {showBottomFade && (
              <LinearGradient
                colors={["rgba(255, 255, 255, 0)", colors.basic.white]}
                style={styles.bottomFade}
                pointerEvents="none"
              />
            )}
          </View>
        ) : (
          <YStack paddingTop="$4" paddingHorizontal="$5" maxHeight={460}>
            {contentBody}
          </YStack>
        )}

        {/* 卡片底部互動區（reaction + 留言），對齊 product 的 bottomActions */}
        {bottomActions && (
          <View borderTopWidth={1} borderTopColor={colors.gray.light}>
            {bottomActions}
          </View>
        )}
      </YStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
  scrollArea: {
    maxHeight: CONTENT_MAX_HEIGHT,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_FADE_HEIGHT,
  },
  notebookHole: {
    position: "absolute",
    top: -28,
    left: 0,
  },
  stampDate: {
    transform: [{ rotate: "15deg" }],
  },
  imageScatter: {
    position: "relative",
    width: "100%",
    height: 210,
    marginTop: 8,
  },
  polaroid: {
    position: "absolute",
    width: 180,
  },
  polaroidClip: {
    width: "100%",
    aspectRatio: 103 / 67,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.basic[200],
    overflow: "hidden",
    backgroundColor: colors.basic.white,
  },
  polaroid0: {
    top: 48,
    left: 8,
    transform: [{ rotate: "-8deg" }],
    zIndex: 2,
  },
  polaroid1: {
    top: 8,
    right: 8,
    transform: [{ rotate: "12deg" }],
    zIndex: 1,
  },
  polaroid2: {
    bottom: 0,
    left: 45,
    zIndex: 0,
  },
  tape: {
    position: "absolute",
    top: -14,
    left: 55,
    transform: [{ rotate: "6deg" }],
    zIndex: 10,
  },
});
