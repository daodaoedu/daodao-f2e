import { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { MOOD_EMOJI_SVG, MOOD_OPTIONS, type MoodType } from "@/constants/mood";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

interface IMoodSelectorProps {
  value: MoodType | null;
  onChange: (mood: MoodType) => void;
}

/**
 * 心情選擇器組件 (Mobile)
 */
export const MoodSelector = ({ value, onChange }: IMoodSelectorProps) => {
  const t = useMobileTranslation("mobile.checkIn");
  const handleSelect = useCallback(
    (mood: MoodType) => {
      onChange(mood);
    },
    [onChange]
  );

  return (
    <YStack marginBottom="$6">
      <Text fontSize={16} fontWeight="500" color={colors.text.dark} marginBottom="$3">
        {t("mood_question")}
      </Text>
      <XStack justifyContent="space-between">
        {MOOD_OPTIONS.map((moodOption) => {
          const isSelected = value === moodOption.id;
          const MoodSvg = MOOD_EMOJI_SVG[moodOption.id];
          return (
            <Pressable
              key={moodOption.id}
              onPress={() => handleSelect(moodOption.id)}
              style={[styles.moodItem, isSelected && styles.moodItemSelected]}
              accessibilityLabel={t(moodOption.labelKey)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
            >
              {MoodSvg && <MoodSvg width={48} height={48} />}
              <Text fontSize={12} color={colors.text.dark}>
                {t(moodOption.labelKey)}
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
