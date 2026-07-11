import { Camera, Check, Plus, Share2, Sparkles, X } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard, Pressable, ScrollView as RNScrollView, StyleSheet } from "react-native";
import { Input, Sheet, Spinner, Text, TextArea, View, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { analyticsService } from "@/services/analytics";
import type { IPractice } from "@/types/practice";

// 心情類型定義
export type MoodType = "hopeless" | "frustrated" | "bored" | "neutral" | "fine" | "happy";

const MOOD_OPTIONS: { id: MoodType; labelKey: string; emoji: string }[] = [
  { id: "hopeless", labelKey: "mood_hopeless", emoji: "😩" },
  { id: "frustrated", labelKey: "mood_frustrated", emoji: "😤" },
  { id: "bored", labelKey: "mood_bored", emoji: "😐" },
  { id: "neutral", labelKey: "mood_neutral", emoji: "🙂" },
  { id: "fine", labelKey: "mood_fine", emoji: "😊" },
  { id: "happy", labelKey: "mood_happy", emoji: "🥳" },
];

const DEFAULT_TAG_KEYS = [
  "tag_practice",
  "tag_new_concept",
  "tag_hands_on",
  "tag_interesting",
  "tag_creative",
  "tag_difficult",
  "tag_deliberate_practice",
];

export interface ICheckInData {
  mood: MoodType;
  tags: string[];
  description: string;
  media: string[];
}

interface CheckInSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practice: IPractice | null;
  onCheckIn: (data: ICheckInData) => Promise<{ success: boolean; error?: string }>;
  onShare?: () => void;
}

export function CheckInSheet({
  open,
  onOpenChange,
  practice,
  onCheckIn,
  onShare,
}: CheckInSheetProps) {
  const t = useMobileTranslation("mobile.checkIn");
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 合併預設標籤和自訂標籤
  const defaultTags = useMemo(() => DEFAULT_TAG_KEYS.map((key) => t(key)), [t]);
  const allTags = useMemo(() => [...defaultTags, ...customTags], [defaultTags, customTags]);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setSelectedMood(null);
      setSelectedTags([]);
      setCustomTags([]);
      setCustomTagInput("");
      setDescription("");
      setMedia([]);
      setShowSuccess(false);
    }
  }, [open]);

  const handleAddCustomTag = useCallback(() => {
    const trimmed = customTagInput.trim();
    if (trimmed && !allTags.includes(trimmed)) {
      setCustomTags((prev) => [...prev, trimmed]);
      setSelectedTags((prev) => [...prev, trimmed]);
      setCustomTagInput("");
    }
  }, [customTagInput, allTags]);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handlePickImage = useCallback(async () => {
    if (media.length >= 3) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      selectionLimit: 3 - media.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newMedia = result.assets.map((asset) => asset.uri);
      setMedia((prev) => [...prev, ...newMedia].slice(0, 3));
    }
  }, [media.length]);

  const handleRemoveMedia = useCallback((index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const isFormValid = useMemo(() => {
    return selectedMood !== null && selectedTags.length > 0 && description.trim().length > 0;
  }, [selectedMood, selectedTags, description]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !practice || !isFormValid || !selectedMood) return;

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const result = await onCheckIn({
        mood: selectedMood,
        tags: selectedTags,
        description: description.trim(),
        media,
      });

      if (result.success) {
        analyticsService.trackCheckIn({
          practice_id: practice.id,
          streak_count: practice.currentStreak + 1,
          has_note: true,
        });
        setShowSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    practice,
    isFormValid,
    selectedMood,
    selectedTags,
    description,
    media,
    onCheckIn,
  ]);

  if (!practice) return null;

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[90]}
      dismissOnSnapToBottom
      zIndex={100000}
    >
      <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius={20} borderTopRightRadius={20}>
        <Sheet.Handle backgroundColor="$borderColor" />

        {showSuccess ? (
          // Success State
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            gap="$4"
            paddingVertical="$8"
          >
            <YStack
              width={100}
              height={100}
              backgroundColor={colors.semantic.success}
              borderRadius={50}
              alignItems="center"
              justifyContent="center"
            >
              <Check size={48} color={colors.basic.white} />
            </YStack>
            <YStack alignItems="center" gap="$2">
              <Text fontSize={24} fontWeight="700" color="$color">
                {t("success_title")}
              </Text>
              <XStack alignItems="center" gap="$1">
                <Sparkles size={16} color={colors.semantic.warning} />
                <Text fontSize={16} color={colors.semantic.warning}>
                  {t("streak_days", { count: practice.currentStreak + 1 })}
                </Text>
              </XStack>
            </YStack>

            <XStack gap="$3" paddingTop="$4">
              {onShare && (
                <Button
                  size="$4"
                  backgroundColor={colors.primary.base}
                  pressStyle={{ backgroundColor: colors.primary.darker }}
                  onPress={onShare}
                  accessibilityLabel={t("share_result")}
                >
                  <XStack alignItems="center" gap="$2">
                    <Share2 size={18} color={colors.basic.white} />
                    <Text color={colors.basic.white} fontWeight="600">
                      {t("share")}
                    </Text>
                  </XStack>
                </Button>
              )}
              <Button
                size="$4"
                backgroundColor="transparent"
                borderWidth={1}
                borderColor="$borderColor"
                pressStyle={{ backgroundColor: "$backgroundHover" }}
                onPress={() => onOpenChange(false)}
              >
                <Text color="$color" fontWeight="600">
                  {t("done")}
                </Text>
              </Button>
            </XStack>
          </YStack>
        ) : (
          // Check-in Form
          <YStack flex={1}>
            {/* Header */}
            <XStack
              justifyContent="space-between"
              alignItems="center"
              padding="$4"
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
            >
              <Text fontSize={20} fontWeight="700" color="$color">
                {t("title")}
              </Text>
              <Button size="$3" circular chromeless onPress={() => onOpenChange(false)}>
                <X size={20} color="$color" />
              </Button>
            </XStack>

            <RNScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
              {/* Practice Title */}
              <Text fontSize={16} fontWeight="500" color="$color" marginBottom="$6">
                {practice.title}
              </Text>

              {/* Mood Selection */}
              <YStack marginBottom="$6">
                <Text fontSize={16} fontWeight="500" color="$color" marginBottom="$3">
                  {t("mood_question")}
                </Text>
                <XStack justifyContent="space-between">
                  {MOOD_OPTIONS.map((mood) => {
                    const isSelected = selectedMood === mood.id;
                    return (
                      <Pressable
                        key={mood.id}
                        onPress={() => setSelectedMood(mood.id)}
                        style={[styles.moodItem, isSelected && styles.moodItemSelected]}
                      >
                        <Text fontSize={36}>{mood.emoji}</Text>
                        <Text fontSize={12} color={isSelected ? "#333333" : "#999999"}>
                          {t(mood.labelKey)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </XStack>
              </YStack>

              {/* Tags Selection */}
              <YStack marginBottom="$6">
                <Text fontSize={16} fontWeight="500" color="$color" marginBottom="$3">
                  {t("thoughts")}
                </Text>
                <XStack flexWrap="wrap" gap="$2" marginBottom="$3">
                  {allTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <Pressable
                        key={tag}
                        onPress={() => handleToggleTag(tag)}
                        style={[styles.tag, isSelected && styles.tagSelected]}
                      >
                        <Text fontSize={14} color={isSelected ? "white" : "#666666"}>
                          {tag}
                        </Text>
                        {isSelected && <X size={14} color="white" style={{ marginLeft: 4 }} />}
                      </Pressable>
                    );
                  })}
                </XStack>

                {/* Custom Tag Input */}
                <XStack gap="$2" alignItems="center">
                  <Input
                    flex={1}
                    size="$3"
                    placeholder={t("custom_tag_placeholder")}
                    value={customTagInput}
                    onChangeText={setCustomTagInput}
                    onSubmitEditing={handleAddCustomTag}
                  />
                  <Button
                    size="$3"
                    backgroundColor={colors.primary.base}
                    onPress={handleAddCustomTag}
                    disabled={!customTagInput.trim()}
                  >
                    <XStack alignItems="center" gap="$1">
                      <Plus size={16} color="white" />
                      <Text color="white" fontSize={14}>
                        {t("add")}
                      </Text>
                    </XStack>
                  </Button>
                </XStack>
              </YStack>

              {/* Description */}
              <YStack marginBottom="$6">
                <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                  <Text fontSize={14} color="$color">
                    {t("description_label")}
                  </Text>
                  <Text fontSize={14} color={colors.basic[400]}>
                    {description.length}/300
                  </Text>
                </XStack>
                <TextArea
                  size="$4"
                  placeholder={t("description_placeholder")}
                  value={description}
                  onChangeText={(text) => setDescription(text.slice(0, 300))}
                  numberOfLines={4}
                  borderColor={colors.basic[200]}
                  focusStyle={{ borderColor: colors.primary.base }}
                />
              </YStack>

              {/* Media Upload */}
              <YStack marginBottom="$8">
                <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
                  <Text fontSize={16} fontWeight="500" color="$color">
                    {t("upload_media")}
                  </Text>
                  <Text fontSize={14} color={colors.basic[400]}>
                    {t("uploaded_count", { count: media.length, total: 3 })}
                  </Text>
                </XStack>

                <XStack gap="$3" flexWrap="wrap">
                  {media.map((uri, index) => (
                    <View key={uri} style={styles.mediaPreview}>
                      <View
                        width={80}
                        height={80}
                        backgroundColor={colors.basic[200]}
                        borderRadius="$sm"
                      />
                      <Pressable
                        style={styles.removeMedia}
                        onPress={() => handleRemoveMedia(index)}
                      >
                        <X size={12} color="white" />
                      </Pressable>
                    </View>
                  ))}
                  {media.length < 3 && (
                    <Pressable style={styles.uploadButton} onPress={handlePickImage}>
                      <Camera size={24} color={colors.basic[400]} />
                      <Text fontSize={12} color={colors.basic[400]}>
                        {t("tap_upload")}
                      </Text>
                    </Pressable>
                  )}
                </XStack>
              </YStack>
            </RNScrollView>

            {/* Submit Button */}
            <YStack
              padding="$4"
              borderTopWidth={1}
              borderTopColor="$borderColor"
              backgroundColor="$background"
            >
              <Button
                size="$5"
                backgroundColor={isFormValid ? "#FF8C42" : colors.basic[300]}
                pressStyle={{ opacity: 0.8 }}
                onPress={handleSubmit}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <Spinner color="white" />
                ) : (
                  <XStack alignItems="center" gap="$2">
                    <Check size={18} color="white" />
                    <Text color="white" fontWeight="600" fontSize={16}>
                      {t("submit")}
                    </Text>
                  </XStack>
                )}
              </Button>
            </YStack>
          </YStack>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  moodItem: {
    alignItems: "center",
    opacity: 0.3,
    gap: 4,
  },
  moodItemSelected: {
    opacity: 1,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#16B9B3",
    backgroundColor: "white",
  },
  tagSelected: {
    backgroundColor: "#666666",
    borderColor: "#666666",
  },
  mediaPreview: {
    position: "relative",
  },
  removeMedia: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
