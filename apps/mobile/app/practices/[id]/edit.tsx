import {
  buildEditFrequencyPayload,
  deriveEditFrequency,
  type EditFrequencyOption,
  resolveCustomFrequencyRange,
} from "@daodao/shared/lib/practice-edit-frequency";
import {
  isPracticePrivacyLocked,
  readPracticePrivacyStatus,
  withEditablePrivacy,
} from "@daodao/shared/lib/practice-privacy-lock";
import { Check, ChevronLeft, Eye, EyeOff, Lock } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Input, ScrollView, Spinner, Text, TextArea, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { usePractice } from "@/hooks/usePractices";
import { useMobileTranslation } from "@/i18n";
import { api } from "@/services/api-client";

type PrivacyStatus = "private" | "public" | "delayed";

const frequencyOptions: Array<{
  value: EditFrequencyOption;
  labelKey: string;
  descriptionKey: string;
}> = [
  {
    value: "daily",
    labelKey: "mobile_frequency_daily",
    descriptionKey: "mobile_frequency_daily_description",
  },
  {
    value: "weekly",
    labelKey: "mobile_frequency_weekly",
    descriptionKey: "mobile_frequency_weekly_description",
  },
  {
    value: "custom",
    labelKey: "mobile_frequency_custom",
    descriptionKey: "mobile_frequency_custom_description",
  },
];

const durationOptions = [7, 14, 21, 30, 60, 90, 100, 365];
const sessionDurationOptions = [15, 30, 45, 60];
const MAX_EDIT_TAGS = 5;

function readNumber(record: Record<string, unknown>, key: string, fallback: number) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readString(record: Record<string, unknown>, key: string, fallback = "") {
  const value = record[key];
  return typeof value === "string" ? value : fallback;
}

export default function PracticeEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");
  const { practice, isLoading, mutate } = usePractice(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDays, setTargetDays] = useState(21);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(30);
  const [frequency, setFrequency] = useState<EditFrequencyOption>("custom");
  // 讀不到原本隱私時維持 undefined：不預設 private，存檔也不送，避免把公開實踐改回私人（daodao#358）
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus | undefined>(undefined);
  const [tagsText, setTagsText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 隱私由教練（燈塔本期實踐）或挑戰（共同挑戰實踐）統一設定：server 收到 privacyStatus 會回 400。
  // 共同挑戰另鎖名稱與期間，App 尚未處理（與網頁編輯頁不同）
  const isPrivacyLocked = isPracticePrivacyLocked(practice);

  // 原本的頻率：沒動頻率就不送，避免網頁建立的 2–4、4–7 天被蓋成 3–5 天（daodao#359）
  const originalFrequency = useMemo(
    () => ({
      frequencyMinDays: practice?.frequencyMinDays,
      frequencyMaxDays: practice?.frequencyMaxDays,
    }),
    [practice?.frequencyMinDays, practice?.frequencyMaxDays]
  );
  const customFrequencyRange = resolveCustomFrequencyRange(originalFrequency);

  useEffect(() => {
    if (!practice) return;

    const record = practice as unknown as Record<string, unknown>;
    const initialTitle = readString(record, "title");
    const initialDescription =
      readString(record, "practiceAction") || readString(record, "description");
    const tags = Array.isArray(record.tags)
      ? record.tags.filter((tag): tag is string => typeof tag === "string")
      : [];

    setTitle(initialTitle);
    setDescription(initialDescription);
    setTargetDays(readNumber(record, "durationDays", readNumber(record, "targetDays", 21)));
    setSessionDurationMinutes(readNumber(record, "sessionDurationMinutes", 30));
    setFrequency(deriveEditFrequency(practice));
    setPrivacyStatus(readPracticePrivacyStatus(practice));
    setTagsText(tags.join(", "));
  }, [practice]);

  const privacyOptions = useMemo<
    Array<{
      value: PrivacyStatus;
      labelKey: string;
      descriptionKey: string;
      Icon: typeof Lock;
    }>
  >(
    () => [
      {
        value: "private",
        labelKey: "mobile_privacy_private",
        descriptionKey: "mobile_privacy_private_description",
        Icon: Lock,
      },
      {
        value: "public",
        labelKey: "mobile_privacy_public",
        descriptionKey: "mobile_privacy_public_description",
        Icon: Eye,
      },
      {
        value: "delayed",
        labelKey: "mobile_privacy_delayed",
        descriptionKey: "mobile_privacy_delayed_description",
        Icon: EyeOff,
      },
    ],
    []
  );

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert(t("edit_save_failed"), t("validation_name_required"));
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, MAX_EDIT_TAGS);

      await api.put(
        `/practices/${id}`,
        withEditablePrivacy(
          {
            title: trimmedTitle,
            practiceAction: description.trim(),
            durationDays: targetDays,
            sessionDurationMinutes,
            tags,
            ...buildEditFrequencyPayload(frequency, originalFrequency),
          },
          privacyStatus,
          isPrivacyLocked
        )
      );

      await mutate();
      Alert.alert(t("edit_save_success"), "", [
        {
          text: commonT("confirm"),
          onPress: () => router.replace(`/practices/${id}`),
        },
      ]);
    } catch (error) {
      Alert.alert(
        t("edit_save_failed"),
        error instanceof Error ? error.message : t("edit_save_failed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    );
  }

  if (!practice) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$4">
          <Text fontSize={16} color="$color" opacity={0.6}>
            {t("mobile_practice_not_found")}
          </Text>
          <Button onPress={() => router.back()}>
            <Text>{commonT("back")}</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
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
          <Text fontSize={18} fontWeight="600" color="$color" flex={1}>
            {t("edit_title")}
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <YStack gap="$4">
            <Card
              backgroundColor="$background"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$4"
              gap="$3"
            >
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="500" color="$color">
                  {t("mobile_title_label")}
                </Text>
                <Input
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t("mobile_title_placeholder")}
                />
              </YStack>

              <YStack gap="$2">
                <Text fontSize={14} fontWeight="500" color="$color">
                  {t("mobile_description_label")}
                </Text>
                <TextArea
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t("mobile_description_placeholder")}
                  minHeight={92}
                />
              </YStack>
            </Card>

            <Card
              backgroundColor="$background"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$4"
              gap="$3"
            >
              <Text fontSize={14} fontWeight="500" color="$color">
                {t("mobile_frequency_label")}
              </Text>
              <YStack gap="$2">
                {frequencyOptions.map((option) => {
                  const isSelected = frequency === option.value;
                  return (
                    <Button
                      key={option.value}
                      size="$4"
                      backgroundColor={isSelected ? colors.primary.palest : "$background"}
                      borderWidth={1}
                      borderColor={isSelected ? colors.primary.base : "$borderColor"}
                      onPress={() => setFrequency(option.value)}
                    >
                      <XStack flex={1} justifyContent="space-between" alignItems="center">
                        <YStack>
                          <Text
                            fontSize={15}
                            fontWeight="500"
                            color={isSelected ? colors.primary.darker : "$color"}
                          >
                            {t(option.labelKey)}
                          </Text>
                          <Text fontSize={12} color="$color" opacity={0.6}>
                            {/* 「自訂」顯示實際會保留／送出的天數，不是固定 3–5 天（daodao#359） */}
                            {option.value === "custom"
                              ? t("mobile_frequency_range", customFrequencyRange)
                              : t(option.descriptionKey)}
                          </Text>
                        </YStack>
                        {isSelected && <Check size={20} color={colors.primary.base} />}
                      </XStack>
                    </Button>
                  );
                })}
              </YStack>
            </Card>

            <Card
              backgroundColor="$background"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$4"
              gap="$3"
            >
              <Text fontSize={14} fontWeight="500" color="$color">
                {t("mobile_duration_days_label")}
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {durationOptions.map((days) => (
                  <Button
                    key={days}
                    size="$3"
                    backgroundColor={targetDays === days ? colors.primary.base : "$background"}
                    borderWidth={1}
                    borderColor={targetDays === days ? colors.primary.base : "$borderColor"}
                    onPress={() => setTargetDays(days)}
                  >
                    <Text color={targetDays === days ? colors.basic.white : "$color"}>
                      {t("mobile_days", { count: days })}
                    </Text>
                  </Button>
                ))}
              </XStack>

              <Text fontSize={14} fontWeight="500" color="$color" marginTop="$2">
                {t("mobile_duration_minutes_label")}
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {sessionDurationOptions.map((minutes) => (
                  <Button
                    key={minutes}
                    size="$3"
                    backgroundColor={
                      sessionDurationMinutes === minutes ? colors.primary.base : "$background"
                    }
                    borderWidth={1}
                    borderColor={
                      sessionDurationMinutes === minutes ? colors.primary.base : "$borderColor"
                    }
                    onPress={() => setSessionDurationMinutes(minutes)}
                  >
                    <Text
                      color={sessionDurationMinutes === minutes ? colors.basic.white : "$color"}
                    >
                      {t("mobile_minutes", { count: minutes })}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </Card>

            <Card
              backgroundColor="$background"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$4"
              gap="$3"
            >
              <Text fontSize={14} fontWeight="500" color="$color">
                {t("mobile_tags_limit_label", { max: MAX_EDIT_TAGS })}
              </Text>
              <Input
                value={tagsText}
                onChangeText={setTagsText}
                placeholder={t("mobile_tag_placeholder")}
              />
            </Card>

            {practice.isCohortPrivacyLocked && (
              <Card
                backgroundColor={colors.primary.palest}
                borderWidth={1}
                borderColor="$borderColor"
                padding="$4"
              >
                <Text fontSize={14} color="$color">
                  {t("edit_cohort_privacy_locked")}
                </Text>
              </Card>
            )}

            {!isPrivacyLocked && (
              <Card
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
                padding="$4"
                gap="$3"
              >
                <Text fontSize={14} fontWeight="500" color="$color">
                  {t("mobile_privacy_label")}
                </Text>
                {privacyOptions.map((option) => {
                  const isSelected = privacyStatus === option.value;
                  return (
                    <Button
                      key={option.value}
                      size="$4"
                      backgroundColor={isSelected ? colors.primary.palest : "$background"}
                      borderWidth={1}
                      borderColor={isSelected ? colors.primary.base : "$borderColor"}
                      onPress={() => setPrivacyStatus(option.value)}
                    >
                      <XStack flex={1} alignItems="center" gap="$3">
                        <option.Icon
                          size={20}
                          color={isSelected ? colors.primary.base : colors.basic[400]}
                        />
                        <YStack flex={1}>
                          <Text fontSize={15} fontWeight="500" color="$color">
                            {t(option.labelKey)}
                          </Text>
                          <Text fontSize={12} color="$color" opacity={0.6}>
                            {t(option.descriptionKey)}
                          </Text>
                        </YStack>
                        {isSelected && <Check size={18} color={colors.primary.base} />}
                      </XStack>
                    </Button>
                  );
                })}
              </Card>
            )}
          </YStack>
        </ScrollView>

        <XStack
          padding="$4"
          gap="$3"
          borderTopWidth={1}
          borderTopColor="$borderColor"
          backgroundColor="$background"
        >
          <Button flex={1} variant="outlined" disabled={isSubmitting} onPress={() => router.back()}>
            <Text>{t("edit_cancel")}</Text>
          </Button>
          <Button
            flex={1}
            backgroundColor={colors.logo.orange}
            disabled={isSubmitting}
            onPress={handleSave}
          >
            {isSubmitting ? (
              <Spinner color={colors.basic.white} />
            ) : (
              <Text color={colors.basic.white} fontWeight="600">
                {t("edit_save")}
              </Text>
            )}
          </Button>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}
