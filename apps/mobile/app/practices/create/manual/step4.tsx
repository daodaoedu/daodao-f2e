import { ChevronLeft, ChevronRight, Plus, Tag, X } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, ScrollView, Text, XStack, YStack } from "tamagui";
import { StepIndicator } from "@/components";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { useCreatePractice } from "@/providers/CreatePracticeProvider";

const suggestedTagKeys = [
  "mobile_tag_learning",
  "mobile_tag_health",
  "mobile_tag_exercise",
  "mobile_tag_reading",
  "mobile_tag_meditation",
  "mobile_tag_writing",
  "mobile_tag_coding",
  "mobile_tag_language",
  "mobile_tag_music",
  "mobile_tag_art",
  "mobile_tag_finance",
  "mobile_tag_social",
];

const colorOptions = [
  "#4F46E5",
  "#7C3AED",
  "#EC4899",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#06B6D4",
];

export default function Step4Screen() {
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");
  const { form, currentStep, totalSteps, nextStep, prevStep } = useCreatePractice();
  const {
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

  const [newTag, setNewTag] = useState("");
  const tags = watch("tags") || [];
  const selectedColor = watch("color");

  const handleNext = async () => {
    const isValid = await trigger(["tags", "color"]);
    if (isValid) {
      nextStep();
      router.push("/practices/create/manual/step5");
    }
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && tags.length < 5 && !tags.includes(trimmed)) {
      setValue("tags", [...tags, trimmed]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag)
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button
            size="$4"
            circular
            chromeless
            onPress={handleBack}
            accessibilityLabel={commonT("back")}
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="600" color="$color">
              {t("mobile_step4_title")}
            </Text>
            <Text fontSize={12} color="$color" opacity={0.6}>
              {t("mobile_step_progress", { current: currentStep, total: totalSteps })}
            </Text>
          </YStack>
        </XStack>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$5">
            {/* Tags */}
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <Tag size={18} color="$color" />
                <Text fontSize={14} fontWeight="500" color="$color">
                  {t("mobile_tags_limit_label")}
                </Text>
              </XStack>

              {/* Selected Tags */}
              {tags.length > 0 && (
                <XStack gap="$2" flexWrap="wrap">
                  {tags.map((tag) => (
                    <XStack
                      key={tag}
                      paddingHorizontal="$3"
                      paddingVertical="$1"
                      backgroundColor={colors.primary.palest}
                      borderRadius="$sm"
                      alignItems="center"
                      gap="$1"
                    >
                      <Text fontSize={13} color={colors.primary.darker}>
                        {tag}
                      </Text>
                      <Button size="$1" circular chromeless onPress={() => removeTag(tag)}>
                        <X size={14} color={colors.primary.darker} />
                      </Button>
                    </XStack>
                  ))}
                </XStack>
              )}

              {/* Add Tag Input */}
              {tags.length < 5 && (
                <XStack gap="$2">
                  <Input
                    flex={1}
                    size="$4"
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder={t("mobile_tag_placeholder")}
                    onSubmitEditing={() => addTag(newTag)}
                    maxLength={10}
                  />
                  <Button
                    size="$4"
                    backgroundColor={colors.primary.base}
                    disabled={!newTag.trim()}
                    onPress={() => addTag(newTag)}
                  >
                    <Plus size={20} color={colors.basic.white} />
                  </Button>
                </XStack>
              )}

              {/* Suggested Tags */}
              <YStack gap="$2">
                <Text fontSize={12} color="$color" opacity={0.6}>
                  {t("mobile_suggested_tags")}
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  {suggestedTagKeys
                    .map((key) => t(key))
                    .filter((t) => !tags.includes(t))
                    .slice(0, 8)
                    .map((tag) => (
                      <Button
                        key={tag}
                        size="$2"
                        backgroundColor="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                        pressStyle={{ backgroundColor: colors.primary.palest }}
                        onPress={() => addTag(tag)}
                        disabled={tags.length >= 5}
                      >
                        <Text fontSize={12} color="$color">
                          + {tag}
                        </Text>
                      </Button>
                    ))}
                </XStack>
              </YStack>

              {errors.tags && (
                <Text fontSize={12} color={colors.semantic.error}>
                  {errors.tags.message}
                </Text>
              )}
            </YStack>

            {/* Color */}
            <YStack gap="$3">
              <Text fontSize={14} fontWeight="500" color="$color">
                {t("mobile_theme_color_label")}
              </Text>
              <XStack gap="$3" flexWrap="wrap">
                {colorOptions.map((color) => (
                  <Button
                    key={color}
                    width={48}
                    height={48}
                    borderRadius={24}
                    backgroundColor={color}
                    borderWidth={selectedColor === color ? 3 : 0}
                    borderColor={colors.basic.black}
                    pressStyle={{ scale: 0.95 }}
                    onPress={() => setValue("color", color)}
                  />
                ))}
              </XStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Footer */}
        <YStack padding="$4" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            size="$5"
            backgroundColor={colors.primary.base}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleNext}
          >
            <XStack alignItems="center" gap="$2">
              <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                {t("manual_next_step")}
              </Text>
              <ChevronRight size={20} color={colors.basic.white} />
            </XStack>
          </Button>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
