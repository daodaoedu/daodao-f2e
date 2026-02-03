import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { MOOD_OPTIONS } from "@/constants/mood";
import type { ICheckInDate, ICheckInDisplayData } from "../types";

interface ICheckInDateButtonProps {
  item: ICheckInDate;
  index: number;
  checkIns: Record<string, ICheckInDisplayData>;
  activeCheckInId: string;
  onSelect: (checkInId: string) => void;
}

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

  const moodEmoji = useMemo(() => {
    if (!itemMood) return null;
    const moodOption = MOOD_OPTIONS.find((option) => option.id === itemMood);
    return moodOption?.emoji || null;
  }, [itemMood]);

  const handlePress = () => {
    if (hasCheckIn) {
      onSelect(item.id);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!hasCheckIn}
      accessibilityLabel={
        hasCheckIn
          ? `選擇 ${item.date} 的打卡記錄`
          : `${item.date} 尚未打卡`
      }
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled: !hasCheckIn }}
      style={({ pressed }) => [
        styles.button,
        isActive && styles.buttonActive,
        !hasCheckIn && styles.buttonDisabled,
        pressed && hasCheckIn && !isActive && styles.buttonPressed,
      ]}
    >
      {/* 心情 emoji */}
      {moodEmoji && (
        <View position="absolute" top={-4} right={-4}>
          <Text fontSize={12}>{moodEmoji}</Text>
        </View>
      )}

      {/* 日期數字 */}
      <Text
        fontSize={16}
        fontWeight="500"
        color={isActive ? colors.basic.white : colors.primary.base}
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
    shadowColor: colors.basic.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonActive: {
    backgroundColor: "#FF8C42", // orange
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
