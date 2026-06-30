import { Plus, X } from "@tamagui/lucide-icons";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Button, Input, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

const DEFAULT_TAG_KEYS = [
  "tag_practice",
  "tag_new_concept",
  "tag_hands_on",
  "tag_interesting",
  "tag_creative",
  "tag_difficult",
  "tag_deliberate_practice",
];

interface ITagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  onTagSelected?: (tag: string) => void;
}

/**
 * 標籤選擇器組件 (Mobile)
 */
export const TagSelector = ({ value, onChange, onTagSelected }: ITagSelectorProps) => {
  const t = useMobileTranslation("mobile.checkIn");
  const [customTagInput, setCustomTagInput] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const defaultTags = useMemo(() => DEFAULT_TAG_KEYS.map((key) => t(key)), [t]);

  // 合併預設標籤和自訂標籤
  const availableTags = useMemo(
    () => Array.from(new Set([...defaultTags, ...customTags, ...value])),
    [defaultTags, customTags, value]
  );

  const handleToggleTag = useCallback(
    (tag: string) => {
      const isSelected = value.includes(tag);
      const newTags = isSelected ? value.filter((t) => t !== tag) : [...value, tag];
      onChange(newTags);

      // 當選中標籤時觸發回調
      if (!isSelected) {
        onTagSelected?.(tag);
      }
    },
    [value, onChange, onTagSelected]
  );

  const handleAddCustomTag = useCallback(() => {
    const trimmedTag = customTagInput.trim();
    if (!trimmedTag) return;

    if (!availableTags.includes(trimmedTag)) {
      setCustomTags((prev) => [...prev, trimmedTag]);
    }

    if (!value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      onTagSelected?.(trimmedTag);
    }

    setCustomTagInput("");
  }, [customTagInput, availableTags, value, onChange, onTagSelected]);

  return (
    <YStack marginBottom="$6">
      <Text fontSize={16} fontWeight="500" color={colors.text.dark} marginBottom="$3">
        {t("thoughts")}
      </Text>

      {/* 標籤列表 */}
      <XStack flexWrap="wrap" gap="$2" marginBottom="$3">
        {availableTags.map((tag) => {
          const isSelected = value.includes(tag);
          return (
            <Pressable
              key={tag}
              onPress={() => handleToggleTag(tag)}
              style={[styles.tag, isSelected && styles.tagSelected]}
              accessibilityLabel={tag}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              <Text fontSize={14} color={isSelected ? colors.basic.white : colors.basic["600"]}>
                {tag}
              </Text>
              {isSelected && <X size={14} color={colors.basic.white} />}
            </Pressable>
          );
        })}
      </XStack>

      {/* 自訂標籤輸入框 */}
      <XStack gap="$2" alignItems="center">
        <Input
          flex={1}
          size="$3"
          placeholder={t("custom_tag_placeholder")}
          value={customTagInput}
          onChangeText={setCustomTagInput}
          onSubmitEditing={handleAddCustomTag}
          borderColor={colors.basic["200"]}
          focusStyle={{ borderColor: colors.primary.base }}
        />
        <Button
          size="$3"
          backgroundColor={colors.primary.base}
          pressStyle={{ opacity: 0.8 }}
          onPress={handleAddCustomTag}
          disabled={!customTagInput.trim()}
          opacity={!customTagInput.trim() ? 0.5 : 1}
        >
          <XStack alignItems="center" gap="$1">
            <Plus size={16} color={colors.basic.white} />
            <Text color={colors.basic.white} fontSize={14}>
              {t("add")}
            </Text>
          </XStack>
        </Button>
      </XStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary.base,
    backgroundColor: colors.basic.white,
    gap: 4,
  },
  tagSelected: {
    backgroundColor: colors.basic["500"],
    borderColor: colors.basic["500"],
  },
});
