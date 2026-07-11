import { type PracticeTemplateType, usePracticeTemplateById } from "@daodao/api";
import { Calendar, Check, ChevronLeft, Clock, Tag, Target } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { api } from "@/services/api-client";

type TemplateCreateRequest = {
  title: string;
  practiceAction?: string;
  durationDays: number;
  frequencyMinDays: number;
  frequencyMaxDays: number;
  sessionDurationMinutes: number;
  practiceTimePeriods?: string[];
  tags?: string[];
  resources?: Array<{ name: string; url?: string }>;
};

const buildTemplateCreateRequest = (template: PracticeTemplateType): TemplateCreateRequest => ({
  title: template.title,
  practiceAction: template.practiceAction || template.title,
  durationDays: template.durationDays ?? 30,
  frequencyMinDays: template.frequencyMinDays ?? 3,
  frequencyMaxDays: template.frequencyMaxDays ?? 5,
  sessionDurationMinutes: template.sessionDurationMinutes ?? 30,
  practiceTimePeriods: template.practiceTimePeriods ?? undefined,
  tags: template.suggestedTags ?? undefined,
  resources: template.resources?.map((resource) => ({
    name: resource.name,
    url: resource.url ?? undefined,
  })),
});

export default function TemplatePreviewScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, error, isLoading } = usePracticeTemplateById(templateId);
  const template = useMemo(() => data?.data ?? null, [data]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Spinner color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    );
  }

  if (error || !template) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$4">
          <Text fontSize={16} color="$color" opacity={0.6}>
            {t("template_load_error")}
          </Text>
          <Button onPress={() => router.back()}>
            <Text>{commonT("back")}</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const description =
    template.practiceAction || template.suggestedTags?.join("、") || template.title;
  const frequency =
    template.frequencyMinDays && template.frequencyMaxDays
      ? t("mobile_frequency_range", {
          min: template.frequencyMinDays,
          max: template.frequencyMaxDays,
        })
      : t("mobile_frequency_default");
  const durationDays = template.durationDays ?? 30;
  const durationMinutes = template.sessionDurationMinutes ?? 30;

  const handleUseTemplate = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<{ data?: { id?: string } }>(
        "/practices",
        buildTemplateCreateRequest(template)
      );
      const practiceId = response?.data?.id;
      Alert.alert(t("mobile_create_success_title"), t("mobile_create_success_message"), [
        {
          text: commonT("confirm"),
          onPress: () => {
            router.replace(practiceId ? `/practices/${practiceId}` : "/(tabs)");
          },
        },
      ]);
    } catch (createError) {
      Alert.alert(
        t("create_failed"),
        createError instanceof Error ? createError.message : t("create_failed_retry")
      );
    } finally {
      setIsSubmitting(false);
    }
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
            onPress={() => router.back()}
            accessibilityLabel={commonT("back")}
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            {t("create_title")}
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          {/* Template Header */}
          <YStack alignItems="center" gap="$4" marginBottom="$6">
            <YStack
              width={100}
              height={100}
              backgroundColor={colors.primary.palest}
              borderRadius={50}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={42} color={colors.primary.base} fontWeight="700">
                {template.title.slice(0, 1)}
              </Text>
            </YStack>
            <YStack alignItems="center" gap="$2">
              <Text fontSize={24} fontWeight="700" color="$color" textAlign="center">
                {template.title}
              </Text>
              <Text fontSize={14} color="$color" opacity={0.6} textAlign="center">
                {description}
              </Text>
            </YStack>
          </YStack>

          {/* Template Details */}
          <YStack gap="$4" marginBottom="$6">
            <YStack padding="$4" backgroundColor={colors.basic[100]} borderRadius="$md" gap="$3">
              <XStack alignItems="center" gap="$3">
                <Calendar size={20} color={colors.primary.base} />
                <YStack flex={1}>
                  <Text fontSize={13} color="$color" opacity={0.6}>
                    {t("mobile_frequency_label")}
                  </Text>
                  <Text fontSize={15} fontWeight="500" color="$color">
                    {frequency}
                  </Text>
                </YStack>
              </XStack>

              <XStack alignItems="center" gap="$3">
                <Target size={20} color={colors.primary.base} />
                <YStack flex={1}>
                  <Text fontSize={13} color="$color" opacity={0.6}>
                    {t("mobile_duration_days_label")}
                  </Text>
                  <Text fontSize={15} fontWeight="500" color="$color">
                    {t("mobile_days", { count: durationDays })}
                  </Text>
                </YStack>
              </XStack>

              <XStack alignItems="center" gap="$3">
                <Clock size={20} color={colors.primary.base} />
                <YStack flex={1}>
                  <Text fontSize={13} color="$color" opacity={0.6}>
                    {t("mobile_duration_minutes_label")}
                  </Text>
                  <Text fontSize={15} fontWeight="500" color="$color">
                    {t("mobile_minutes", { count: durationMinutes })}
                  </Text>
                </YStack>
              </XStack>
            </YStack>

            {/* Tags */}
            {template.suggestedTags && template.suggestedTags.length > 0 && (
              <YStack gap="$2">
                <XStack alignItems="center" gap="$2">
                  <Tag size={16} color="$color" />
                  <Text fontSize={13} color="$color" opacity={0.6}>
                    {t("step4_tags_label")}
                  </Text>
                </XStack>
                <XStack gap="$2" flexWrap="wrap">
                  {template.suggestedTags.map((tag) => (
                    <YStack
                      key={tag}
                      paddingHorizontal="$3"
                      paddingVertical="$1"
                      backgroundColor={colors.primary.palest}
                      borderRadius="$sm"
                    >
                      <Text fontSize={13} color={colors.primary.base}>
                        {tag}
                      </Text>
                    </YStack>
                  ))}
                </XStack>
              </YStack>
            )}
          </YStack>
        </ScrollView>

        {/* Footer */}
        <YStack padding="$4" gap="$3" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            size="$5"
            backgroundColor={colors.primary.base}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleUseTemplate}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner color={colors.basic.white} />
            ) : (
              <XStack alignItems="center" gap="$2">
                <Check size={20} color={colors.basic.white} />
                <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                  {t("template_looks_good")}
                </Text>
              </XStack>
            )}
          </Button>
          <Button
            size="$4"
            backgroundColor="transparent"
            borderWidth={1}
            borderColor="$borderColor"
            onPress={() => router.push("/practices/create/manual/step1")}
          >
            <Text color="$color" fontWeight="500">
              {t("create_manual")}
            </Text>
          </Button>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
