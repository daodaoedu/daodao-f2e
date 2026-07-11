import { useTagPrompts } from "@daodao/api";
import { Plus, X } from "@tamagui/lucide-icons";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Input, Text, View, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileI18n, useMobileTranslation } from "@/i18n";

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
  /** 選中標籤時的回調（僅在「自動填入」開關開啟時觸發，對齊 product 的引導句 auto-fill） */
  onTagSelected?: (tag: string) => void;
}

/**
 * 標籤選擇器組件 (Mobile) — 對齊 product：API 引導句標籤 + 自動填入開關
 */
export const TagSelector = ({ value, onChange, onTagSelected }: ITagSelectorProps) => {
  const t = useMobileTranslation("mobile.checkIn");
  const { locale } = useMobileI18n();
  const [customTagInput, setCustomTagInput] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [promptEnabled, setPromptEnabled] = useState(false);

  // 從 API 取得引導句標籤（限 8 個），對齊 product
  const { data: tagPromptsData } = useTagPrompts({ usageType: "checkin", locale });
  const apiTags = useMemo(() => {
    const list = (tagPromptsData as { data?: { tagName?: string }[] } | undefined)?.data;
    if (!Array.isArray(list)) return [];
    return list
      .map((item) => item.tagName)
      .filter((name): name is string => Boolean(name))
      .slice(0, 8);
  }, [tagPromptsData]);

  // API 無資料時使用預設標籤（i18n）
  const fallbackTags = useMemo(() => DEFAULT_TAG_KEYS.map((key) => t(key)), [t]);
  const baseTagList = apiTags.length > 0 ? apiTags : fallbackTags;

  // 合併基礎標籤、自訂標籤與已選標籤
  const availableTags = useMemo(
    () => Array.from(new Set([...baseTagList, ...customTags, ...value])),
    [baseTagList, customTags, value]
  );

  const handleToggleTag = useCallback(
    (tag: string) => {
      const isSelected = value.includes(tag);
      const newTags = isSelected ? value.filter((t) => t !== tag) : [...value, tag];
      onChange(newTags);

      // 選中且開關開啟時，取得該標籤的引導句
      if (!isSelected && promptEnabled) {
        onTagSelected?.(tag);
      }
    },
    [value, onChange, onTagSelected, promptEnabled]
  );

  const handleAddCustomTag = useCallback(() => {
    const trimmedTag = customTagInput.trim();
    if (!trimmedTag) return;

    if (!availableTags.includes(trimmedTag)) {
      setCustomTags((prev) => [...prev, trimmedTag]);
    }

    if (!value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      if (promptEnabled) {
        onTagSelected?.(trimmedTag);
      }
    }

    setCustomTagInput("");
  }, [customTagInput, availableTags, value, onChange, onTagSelected, promptEnabled]);

  return (
    <YStack marginBottom="$6">
      <Text fontSize={16} fontWeight="500" color={colors.text.dark} marginBottom="$3">
        {t("thoughts")}
      </Text>

      {/* 自動填入引導句開關，對齊 product */}
      <XStack alignItems="center" gap="$2" marginBottom="$3">
        <Pressable
          onPress={() => setPromptEnabled((v) => !v)}
          accessibilityRole="switch"
          accessibilityState={{ checked: promptEnabled }}
          accessibilityLabel={t("auto_fill_text")}
          style={[
            styles.track,
            { backgroundColor: promptEnabled ? colors.logo.gray : colors.basic[200] },
          ]}
        >
          <View
            width={16}
            height={16}
            borderRadius={8}
            backgroundColor={colors.basic.white}
            style={{ transform: [{ translateX: promptEnabled ? 16 : 0 }] }}
          />
        </Pressable>
        <Text fontSize={14} color={colors.basic[400]}>
          {t("auto_fill_text")}
        </Text>
      </XStack>

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
  track: {
    width: 36,
    height: 20,
    borderRadius: 10,
    padding: 2,
    justifyContent: "center",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary.base,
    backgroundColor: colors.basic.white,
    gap: 4,
  },
  tagSelected: {
    backgroundColor: colors.logo.gray,
    borderColor: colors.logo.gray,
  },
});
