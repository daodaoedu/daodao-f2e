import { Check, ChevronRight, Flame, PenLine } from "@tamagui/lucide-icons";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";
import { Button, Card, Spinner, Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import type { IPractice } from "@/types/practice";

type CardVariantType = "default" | "gradient" | "completed";

// 卡片尺寸 - 對應 Product 的 w-[294px]
const CARD_WIDTH = 294;
const CARD_HEIGHT = 239;

// SVG 背景組件 - 對應 Product 的 YellowSvg, BlueSvg, PinkSvg, GreenSvg
// Product 使用 mix-blend-mode: soft-light，在 RN 中簡化為近似效果
function YellowBackground() {
  return (
    <Svg
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      viewBox="0 0 294 239"
      style={StyleSheet.absoluteFill}
    >
      <Rect width="294" height="239" fill="#FFE394" />
      {/* 右側三個圓點 - 與 Product 一致 */}
      <Circle cx="276" cy="157" r="6" fill="white" fillOpacity={0.35} />
      <Circle cx="276" cy="185.6" r="6" fill="white" fillOpacity={0.35} />
      <Circle cx="276" cy="214.9" r="6" fill="white" fillOpacity={0.35} />
    </Svg>
  );
}

function BlueBackground() {
  return (
    <Svg
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      viewBox="0 0 294 239"
      style={StyleSheet.absoluteFill}
    >
      <Rect width="294" height="239" fill="#C3EEFF" />
    </Svg>
  );
}

function PinkBackground() {
  return (
    <Svg
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      viewBox="0 0 294 239"
      style={StyleSheet.absoluteFill}
    >
      <Rect width="294" height="239" fill="#FFC0C8" />
      {/* 右上三個圓點 */}
      <Circle cx="212" cy="22" r="6" fill="white" fillOpacity={0.35} />
      <Circle cx="240.6" cy="22" r="6" fill="white" fillOpacity={0.35} />
      <Circle cx="269.9" cy="22" r="6" fill="white" fillOpacity={0.35} />
    </Svg>
  );
}

function GreenBackground() {
  return (
    <Svg
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      viewBox="0 0 294 239"
      style={StyleSheet.absoluteFill}
    >
      <Rect width="294" height="239" fill="#A0E8D0" />
    </Svg>
  );
}

// 主題背景對應
const themeBackgrounds: Record<string, React.FC> = {
  yellow: YellowBackground,
  blue: BlueBackground,
  pink: PinkBackground,
  green: GreenBackground,
};

// 狀態標籤配置 - 對應 Product 的 Badge variants
const statusConfig: Record<
  string,
  { labelKey: string; backgroundColor: string; textColor: string; borderColor: string }
> = {
  draft: {
    // outline-ghost: transparent bg, light-gray border
    labelKey: "status_draft",
    backgroundColor: "transparent",
    textColor: "#666666",
    borderColor: "#9CA3AF", // light-gray
  },
  "not-started": {
    // very-light-blue: very-light-blue bg and border
    labelKey: "status_not_started",
    backgroundColor: "#E6FFFE", // very-light-blue
    textColor: "#333333",
    borderColor: "#E6FFFE",
  },
  "in-progress": {
    // default: logo-cyan bg, white text
    labelKey: "status_in_progress",
    backgroundColor: "#16B9B3", // logo-cyan
    textColor: "#FFFFFF",
    borderColor: "transparent",
  },
  active: {
    labelKey: "status_in_progress",
    backgroundColor: "#16B9B3",
    textColor: "#FFFFFF",
    borderColor: "transparent",
  },
  completed: {
    labelKey: "status_completed",
    backgroundColor: "#16B9B3",
    textColor: "#FFFFFF",
    borderColor: "transparent",
  },
};

interface PracticeCardProps {
  practice: IPractice;
  onPress?: () => void;
  onCheckIn?: () => void;
  showCheckInButton?: boolean;
  isCheckingIn?: boolean;
  variant?: CardVariantType;
}

export function PracticeCard({
  practice,
  onPress,
  onCheckIn,
  showCheckInButton = true,
  isCheckingIn = false,
  variant = "default",
}: PracticeCardProps) {
  const t = useMobileTranslation("mobile.practiceCard");
  const progress = useMemo(() => {
    return practice.targetDays > 0
      ? Math.round((practice.completedDays / practice.targetDays) * 100)
      : 0;
  }, [practice.completedDays, practice.targetDays]);

  const accessibilityLabel = useMemo(() => {
    const status = practice.todayCheckedIn ? t("today_completed") : t("today_pending");
    const streak =
      practice.currentStreak > 0
        ? t("accessibility_streak", { count: practice.currentStreak })
        : "";
    return t("accessibility_label", {
      title: practice.title,
      status,
      progress,
      streak,
    });
  }, [practice.title, practice.todayCheckedIn, practice.currentStreak, progress, t]);

  // 獲取主題
  const theme = practice.theme || "yellow";
  const status = practice.status || "in-progress";
  const statusInfo = statusConfig[status] || statusConfig["in-progress"];
  const isDraft = status === "draft";

  // 獲取主題背景組件
  const ThemeBackground = themeBackgrounds[theme] || themeBackgrounds.yellow;

  // 漸層卡片樣式 (進行中區塊用)
  if (variant === "gradient") {
    return (
      <Card
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        overflow="hidden"
        borderRadius={12}
        pressStyle={{ scale: 0.98, opacity: 0.9 }}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={t("view_detail_hint")}
      >
        {/* SVG 背景 */}
        <ThemeBackground />

        {/* 內容層 - 絕對定位在 SVG 上方，底部留空給進度條 */}
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={10}
          padding={20}
          paddingBottom={16}
        >
          <YStack flex={1} gap={16}>
            {/* 頂部標籤列 */}
            <XStack justifyContent="space-between" alignItems="center">
              {/* 分類標籤 - secondary variant: white/70 bg, white border */}
              <XStack
                backgroundColor="rgba(255, 255, 255, 0.7)"
                paddingHorizontal={8}
                paddingVertical={2}
                borderRadius={9999}
                borderWidth={1}
                borderColor="white"
              >
                <Text fontSize={12} color="#333333">
                  {t("practice_label")}
                </Text>
              </XStack>

              {/* 狀態標籤 */}
              <XStack
                backgroundColor={statusInfo.backgroundColor}
                paddingHorizontal={8}
                paddingVertical={2}
                borderRadius={9999}
                borderWidth={1}
                borderColor={statusInfo.borderColor}
              >
                <Text fontSize={12} color={statusInfo.textColor}>
                  {t(statusInfo.labelKey)}
                </Text>
              </XStack>
            </XStack>

            {/* 標題與描述 + 箭頭 */}
            <XStack flex={1} gap={8}>
              <YStack flex={1} gap={8}>
                <Text fontSize={20} fontWeight="500" color="#333333" numberOfLines={1}>
                  {practice.title}
                </Text>
                <Text fontSize={12} color="#333333" numberOfLines={2}>
                  {practice.description || t("default_description")}
                </Text>
              </YStack>
              {/* 右側箭頭 - light-gray */}
              <View alignSelf="center">
                <ChevronRight size={24} color="#9CA3AF" />
              </View>
            </XStack>

            {/* 打卡次數 */}
            <XStack alignItems="center" gap={4}>
              <Text fontSize={12} color="#333333">
                {t("checked_in")}
              </Text>
              <Text fontSize={12} color="#333333" fontWeight="600">
                {practice.completedDays}
              </Text>
              <Text fontSize={12} color="#333333">
                {t("times_unit")}
              </Text>
            </XStack>

            {/* 打卡按鈕 - secondary variant: white bg, subtle cyan shadow */}
            {isDraft ? (
              <Button
                backgroundColor="white"
                borderRadius={24}
                height={40}
                pressStyle={{ opacity: 0.8 }}
                onPress={(e) => {
                  e.stopPropagation();
                  onPress?.();
                }}
                style={{
                  shadowColor: "rgba(22, 185, 179, 0.3)",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 3,
                }}
              >
                <XStack alignItems="center" gap={8}>
                  <PenLine size={16} color="#16B9B3" />
                  <Text color="#333333" fontWeight="500" fontSize={14}>
                    {t("continue_editing")}
                  </Text>
                </XStack>
              </Button>
            ) : showCheckInButton && !practice.todayCheckedIn ? (
              <Button
                backgroundColor="white"
                borderRadius={24}
                height={40}
                pressStyle={{ opacity: 0.8 }}
                onPress={(e) => {
                  e.stopPropagation();
                  onCheckIn?.();
                }}
                disabled={isCheckingIn}
                style={{
                  shadowColor: "rgba(22, 185, 179, 0.3)",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 3,
                }}
              >
                {isCheckingIn ? (
                  <Spinner size="small" color="#16B9B3" />
                ) : (
                  <XStack alignItems="center" gap={8}>
                    <Check size={16} color="#16B9B3" />
                    <Text color="#333333" fontWeight="500" fontSize={14}>
                      {t("check_in")}
                    </Text>
                  </XStack>
                )}
              </Button>
            ) : null}
          </YStack>
        </View>

        {/* 底部進度條 - 對應 Product Progress component */}
        <View
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height={10}
          backgroundColor="rgba(51, 51, 51, 0.3)"
          overflow="hidden"
          borderBottomLeftRadius={12}
          borderBottomRightRadius={12}
        >
          <View height={10} width={`${progress}%`} backgroundColor="#A6E0EC" />
        </View>
      </Card>
    );
  }

  // 已完成卡片樣式 - 與 Product CompletedTaskCard 一致
  if (variant === "completed") {
    const displayTags = practice.tags?.slice(0, 2) || [];
    const remainingTagsCount = (practice.tags?.length || 0) - 2;

    return (
      <Card
        paddingHorizontal={16}
        paddingVertical={12}
        backgroundColor="white"
        borderRadius={12}
        borderWidth={1}
        borderColor="#E5E7EB"
        pressStyle={{ scale: 0.98, opacity: 0.9 }}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={t("view_detail_hint")}
      >
        <YStack gap={4}>
          {/* 頂部：分類標籤 + Tags */}
          <XStack justifyContent="space-between" alignItems="center" gap={4}>
            {/* 分類標籤 - outline-logo variant */}
            <XStack
              backgroundColor="white"
              paddingHorizontal={8}
              paddingVertical={2}
              borderRadius={9999}
              borderWidth={1}
              borderColor={colors.primary.base}
            >
              <Text fontSize={12} color={colors.primary.base}>
                {t("practice_label")}
              </Text>
            </XStack>

            {/* Tags */}
            <XStack gap={8} alignItems="center" flexShrink={1}>
              {displayTags.map((tag) => (
                <XStack
                  key={tag}
                  backgroundColor="#F3F4F6"
                  paddingHorizontal={8}
                  paddingVertical={2}
                  borderRadius={9999}
                >
                  <Text fontSize={12} color="#6B7280">
                    {tag}
                  </Text>
                </XStack>
              ))}
              {remainingTagsCount > 0 && (
                <Text fontSize={12} color="#9CA3AF">
                  +{remainingTagsCount}
                </Text>
              )}
            </XStack>
          </XStack>

          {/* 中間：標題 + 描述 + 箭頭 */}
          <XStack gap={8} marginBottom={6}>
            <YStack flex={1} gap={4}>
              <Text fontSize={16} fontWeight="500" color="#333333" numberOfLines={1}>
                {practice.title}
              </Text>
              <Text fontSize={12} color="#333333" numberOfLines={2}>
                {practice.description || t("default_description")}
              </Text>
            </YStack>
            <View alignSelf="center">
              <ChevronRight size={24} color="#9CA3AF" />
            </View>
          </XStack>

          {/* 底部：進度條 */}
          <View height={6} backgroundColor="#A6E0EC" borderRadius={9999} width="100%" />
        </YStack>
      </Card>
    );
  }

  // 預設卡片樣式 (舊版)
  const cardColor = practice.color || colors.primary.base;

  return (
    <Card
      padding="$4"
      backgroundColor="$background"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={t("view_detail_hint")}
    >
      <XStack gap="$4" alignItems="center">
        {/* Content */}
        <YStack flex={1} gap="$1">
          <XStack alignItems="center" gap="$2">
            <Text fontSize={16} fontWeight="600" color="$color" numberOfLines={1} flex={1}>
              {practice.title}
            </Text>
            {practice.todayCheckedIn && (
              <XStack
                backgroundColor={colors.semantic.success}
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$sm"
                accessibilityLabel={t("today_completed")}
              >
                <Check size={12} color={colors.basic.white} />
              </XStack>
            )}
          </XStack>

          <XStack alignItems="center" gap="$3">
            <Text fontSize={13} color="$color" opacity={0.6}>
              {t("days_progress", {
                completed: practice.completedDays,
                total: practice.targetDays,
              })}
            </Text>

            {practice.currentStreak > 0 && (
              <XStack alignItems="center" gap="$1">
                <Flame size={14} color={colors.semantic.warning} />
                <Text fontSize={13} color={colors.semantic.warning}>
                  {t("streak_days", { count: practice.currentStreak })}
                </Text>
              </XStack>
            )}
          </XStack>

          {practice.tags && practice.tags.length > 0 && (
            <XStack gap="$1" flexWrap="wrap" marginTop="$1">
              {practice.tags.slice(0, 3).map((tag) => (
                <XStack
                  key={tag}
                  backgroundColor={colors.basic[100]}
                  paddingHorizontal="$2"
                  paddingVertical={2}
                  borderRadius="$none"
                >
                  <Text fontSize={11} color="$color" opacity={0.7}>
                    {tag}
                  </Text>
                </XStack>
              ))}
            </XStack>
          )}
        </YStack>

        {/* Actions */}
        <XStack alignItems="center" gap="$2">
          {showCheckInButton && !practice.todayCheckedIn && (
            <Button
              size="$3"
              backgroundColor={cardColor}
              pressStyle={{ opacity: 0.8 }}
              onPress={(e) => {
                e.stopPropagation();
                onCheckIn?.();
              }}
              circular
              disabled={isCheckingIn}
              accessibilityRole="button"
              accessibilityLabel={t("check_in_practice", { title: practice.title })}
              accessibilityHint={t("check_in_hint")}
            >
              {isCheckingIn ? (
                <Spinner size="small" color={colors.basic.white} />
              ) : (
                <Check size={18} color={colors.basic.white} />
              )}
            </Button>
          )}
          <ChevronRight size={20} color="$color" opacity={0.4} />
        </XStack>
      </XStack>
    </Card>
  );
}

const _styles = StyleSheet.create({});
