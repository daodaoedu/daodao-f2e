import { Plus, X } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Input, Text, XStack, YStack } from "tamagui";
import { ManualStepShell } from "@/components/practice/create/manual/ManualStepShell";
import { ResourceCard, ResourceGrid } from "@/components/practice/shared";
import { Button } from "@/components/ui/button";
import { MAX_PRACTICE_TAGS } from "@/constants/practice-form";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { useCreatePractice } from "@/providers/CreatePracticeProvider";

const TAG_MAX_LENGTH = 20;
const RESOURCE_NAME_MAX = 100;

export default function Step4Screen() {
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const { form, currentStep, totalSteps, nextStep, prevStep } = useCreatePractice();
  const {
    watch,
    setValue,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = form;
  const cyan = colors.logo.cyan;

  const [newTag, setNewTag] = useState("");
  const [resourceName, setResourceName] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");

  const name = watch("name");
  const actionDescription = watch("actionDescription");
  const tags = watch("tags") ?? [];
  const resources = watch("resources") ?? [];

  const handleNext = async () => {
    if (await trigger(["tags", "resources"])) {
      nextStep();
      router.push("/practices/create/manual/step5");
    }
  };

  const handlePrev = () => {
    prevStep();
    router.back();
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && tags.length < MAX_PRACTICE_TAGS && !tags.includes(trimmed)) {
      setValue("tags", [...tags, trimmed]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((item) => item !== tag)
    );
  };

  const addResource = () => {
    const trimmedName = resourceName.trim();
    const trimmedUrl = resourceUrl.trim();
    if (!trimmedName) return;

    if (trimmedUrl) {
      let parsed: URL | null = null;
      try {
        parsed = new URL(trimmedUrl);
      } catch {
        setError("resources", { type: "manual", message: t("step4_url_invalid") });
        return;
      }
      if (parsed.protocol !== "https:") {
        setError("resources", { type: "manual", message: t("step4_url_https_required") });
        return;
      }
    }

    setValue("resources", [
      ...resources,
      { id: Date.now().toString(), name: trimmedName, url: trimmedUrl || undefined },
    ]);
    setResourceName("");
    setResourceUrl("");
    clearErrors("resources");
  };

  const removeResource = (id: string) => {
    setValue(
      "resources",
      resources.filter((resource) => resource.id !== id)
    );
  };

  return (
    <ManualStepShell
      step={currentStep}
      totalSteps={totalSteps}
      title={t("manual_create_title")}
      name={name}
      actionDescription={actionDescription}
      showEcho
      onPrev={handlePrev}
      onNext={handleNext}
      nextLabel={t("manual_next_step")}
    >
      <YStack gap="$6">
        {/* Tags */}
        <YStack gap="$3">
          <Text fontSize={16} color={colors.text.dark}>
            {t("step4_tags_label")}
          </Text>

          {tags.length > 0 && (
            <XStack gap="$2" flexWrap="wrap">
              {tags.map((tag) => (
                <XStack
                  key={tag}
                  paddingHorizontal="$3"
                  paddingVertical="$1.5"
                  backgroundColor={colors.background.lightCyan}
                  borderRadius={8}
                  borderWidth={1}
                  borderColor={colors.border.lightCyan}
                  alignItems="center"
                  gap="$1"
                >
                  <Text fontSize={13} color={cyan}>
                    {tag}
                  </Text>
                  <X size={14} color={cyan} onPress={() => removeTag(tag)} />
                </XStack>
              ))}
            </XStack>
          )}

          {tags.length < MAX_PRACTICE_TAGS && (
            <XStack gap="$2">
              <Input
                flex={1}
                size="$4"
                value={newTag}
                onChangeText={setNewTag}
                placeholder={t("mobile_tag_placeholder")}
                onSubmitEditing={() => addTag(newTag)}
                maxLength={TAG_MAX_LENGTH}
                backgroundColor={colors.basic.white}
                borderColor={colors.gray.light}
                focusStyle={{ borderColor: cyan }}
              />
              <Button
                size="$4"
                circular
                backgroundColor={cyan}
                disabled={!newTag.trim()}
                onPress={() => addTag(newTag)}
              >
                <Plus size={20} color={colors.basic.white} />
              </Button>
            </XStack>
          )}

          {errors.tags && (
            <Text fontSize={12} color={colors.semantic.error}>
              {errors.tags.message}
            </Text>
          )}
        </YStack>

        {/* Resources */}
        <YStack gap="$3">
          <Text fontSize={16} color={colors.text.dark}>
            {t("step4_resources_label")}
          </Text>
          <YStack
            padding="$3"
            backgroundColor={colors.background.veryLightBlue}
            borderRadius={8}
            borderWidth={1}
            borderColor={colors.border.lightCyan}
          >
            <Text fontSize={13} color={colors.text.dark}>
              {t("step4_resources_description")}
            </Text>
          </YStack>

          <Input
            size="$4"
            value={resourceName}
            onChangeText={setResourceName}
            placeholder={t("step4_resource_name_placeholder")}
            maxLength={RESOURCE_NAME_MAX}
            backgroundColor={colors.basic.white}
            borderColor={colors.gray.light}
            focusStyle={{ borderColor: cyan }}
          />
          <Input
            size="$4"
            value={resourceUrl}
            onChangeText={setResourceUrl}
            placeholder={t("step4_resource_url_placeholder")}
            autoCapitalize="none"
            keyboardType="url"
            backgroundColor={colors.basic.white}
            borderColor={colors.gray.light}
            focusStyle={{ borderColor: cyan }}
          />
          {errors.resources && (
            <Text fontSize={12} color={colors.semantic.error}>
              {errors.resources.message}
            </Text>
          )}
          <Button
            size="$4"
            backgroundColor={cyan}
            pressStyle={{ opacity: 0.85 }}
            disabled={!resourceName.trim()}
            onPress={addResource}
          >
            <XStack alignItems="center" gap="$2">
              <Plus size={18} color={colors.basic.white} />
              <Text color={colors.basic.white} fontWeight="600" fontSize={15}>
                {t("step4_add_resource")}
              </Text>
            </XStack>
          </Button>

          {resources.length > 0 && (
            <ResourceGrid>
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onRemove={() => removeResource(resource.id)}
                />
              ))}
            </ResourceGrid>
          )}
        </YStack>
      </YStack>
    </ManualStepShell>
  );
}
