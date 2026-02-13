import { useMemo } from "react";
import { Pressable, StyleSheet, View as RNView } from "react-native";
import { Text, View } from "tamagui";
import { MOOD_OPTIONS } from "@/constants/mood";
import { colors } from "@/generated/design-tokens";
import type { ICheckInDate, ICheckInDisplayData } from "../types";

interface ICheckInDateButtonProps {
  item: ICheckInDate;
  index: number;
  checkIns: Record<string, ICheckInDisplayData>;
  activeCheckInId: string;
  onSelect: (checkInId: string) => void;
}

/**
 * 根據打卡次數計算橘色填充的透明度
 * 1 次 = 10%, 2 次 = 20%, ..., 10 次以上 = 100%
 */
const getCheckInOpacity = (checkInCount: number): number => {
  if (checkInCount <= 0) return 0;
  return Math.min(checkInCount * 0.1, 1);
};

/**
 * 打卡日期按鈕組件 (Mobile)
 */
export const CheckInDateButton = ({
  item,
  index,
  checkIns,
  activeCheckInId,
  onSelect,
}: ICheckInDateButtonProps) => {
  const hasCheckIn = item.hasCheckIn ?? !!checkIns[item.id];
  const isActive = hasCheckIn && item.id === activeCheckInId;
  const itemCheckIn = checkIns[item.id];
  const itemMood = itemCheckIn?.mood;

  // 計算打卡次數對應的透明度
  const checkInCount = item.checkInCount ?? (hasCheckIn ? 1 : 0);
  const fillOpacity = getCheckInOpacity(checkInCount);

  const moodEmoji = useMemo(() => {
    if (!itemMood) return null;
    const moodOption = MOOD_OPTIONS.find((option) => option.id === itemMood);
    return moodOption?.emoji || null;
  }, [itemMood]);

  const handlePress = () => {
    onSelect(item.id);
  };

  // 計算橘色填充的 RGBA 值
  const orangeFillColor = `rgba(255, 157, 0, ${fillOpacity})`;

  return (
    <Pressable
      onPress={handlePress}
      disabled={!hasCheckIn}
      accessibilityLabel={hasCheckIn ? `選擇 ${item.date} 的打卡記錄` : `${item.date} 尚未打卡`}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled: !hasCheckIn }}
      style={({ pressed }) => [
        styles.button,
        // 當前選擇：橘色邊框
        isActive && styles.buttonActiveRing,
        // 無打卡時的樣式
        !hasCheckIn && styles.buttonDisabled,
        pressed && hasCheckIn && !isActive && styles.buttonPressed,
      ]}
    >
      {/* 橘色填充層（有打卡時顯示，透明度根據打卡次數） */}
      {hasCheckIn && (
        <RNView
          style={[
            styles.fillOverlay,
            { backgroundColor: orangeFillColor },
          ]}
        />
      )}

      {/* 心情 emoji */}
      {moodEmoji && (
        <View position="absolute" top={-4} right={-4} zIndex={10}>
          <Text fontSize={12}>{moodEmoji}</Text>
        </View>
      )}

      {/* 日期數字 */}
      <Text
        fontSize={16}
        fontWeight="500"
        color={colors.primary.base}
        zIndex={10}
      >
        {index + 1}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.basic.white,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: colors.basic.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonActiveRing: {
    borderWidth: 2,
    borderColor: colors.logo.orange,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  fillOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
