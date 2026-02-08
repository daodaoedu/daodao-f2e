import { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";
import { colors } from "@/generated/design-tokens";

interface IMoodSelectorProps {
  value: MoodType | null;
  onChange: (mood: MoodType) => void;
}

/**
 * 心情選擇器組件 (Mobile)
 */
export const MoodSelector = ({ value, onChange }: IMoodSelectorProps) => {
  const handleSelect = useCallback(
    (mood: MoodType) => {
      onChange(mood);
    },
    [onChange]
  );

  return (
    <YStack marginBottom="$6">
      <Text fontSize={16} fontWeight="500" color={colors.text.dark} marginBottom="$3">
        心情如何?
      </Text>
      <XStack justifyContent="space-between">
        {MOOD_OPTIONS.map((moodOption) => {
          const isSelected = value === moodOption.id;
          return (
            <Pressable
              key={moodOption.id}
              onPress={() => handleSelect(moodOption.id)}
              style={[styles.moodItem, isSelected && styles.moodItemSelected]}
              accessibilityLabel={moodOption.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
            >
              <Text fontSize={36}>{moodOption.emoji}</Text>
              <Text fontSize={12} color={isSelected ? colors.text.dark : colors.basic[400]}>
                {moodOption.label}
              </Text>
            </Pressable>
          );
        })}
      </XStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
  moodItem: {
    alignItems: "center",
    opacity: 0.3,
    gap: 4,
  },
  moodItemSelected: {
    opacity: 1,
  },
});
