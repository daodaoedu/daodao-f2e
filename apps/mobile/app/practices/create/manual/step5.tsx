import { type CreatePracticeRequestType, createPractice } from "@daodao/api";
import {
  Bell,
  Calendar,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Tag,
  Target,
} from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable as RNPressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { StepIndicator } from "@/components";
import { colors } from "@/generated/design-tokens";
import { useCreatePractice } from "@/providers/CreatePracticeProvider";
import type { CreatePracticeInputType } from "@/types/create-practice";

type PracticeTimePeriod = CreatePracticeRequestType["practiceTimePeriods"][number];

function getFrequencyRange(values: CreatePracticeInputType) {
  if (values.frequency === "daily") {
    return { frequencyMinDays: 7, frequencyMaxDays: 7 };
  }

  if (values.frequency === "weekly") {
    return { frequencyMinDays: 1, frequencyMaxDays: 1 };
  }

  const selectedDays = values.customDays?.length ?? 0;
  const days = selectedDays > 0 ? selectedDays : 1;
  return { frequencyMinDays: days, frequencyMaxDays: days };
}

function getPracticeTimePeriods(values: CreatePracticeInputType): PracticeTimePeriod[] {
  if (!values.reminderEnabled || !values.reminderTime) {
    return [];
  }

  const hour = Number.parseInt(values.reminderTime.split(":")[0] ?? "", 10);

  if (Number.isNaN(hour)) {
    return [];
  }

  if (hour < 12) return ["morning"];
  if (hour < 17) return ["afternoon"];
  if (hour < 21) return ["evening"];
  return ["night"];
}

function toCreatePracticeRequest(values: CreatePracticeInputType): CreatePracticeRequestType {
  const request: CreatePracticeRequestType = {
    title: values.title,
    durationDays: values.targetDays,
    ...getFrequencyRange(values),
    practiceTimePeriods: getPracticeTimePeriods(values),
    tags: values.tags ?? [],
    isDraft: false,
  };

  if (values.description) {
    request.practiceAction = values.description;
  }

  return {
    ...request,
    privacy_status: values.privacy_status,
  } as CreatePracticeRequestType;
}

export default function Step5Screen() {
  const router = useRouter();
  const { form, currentStep, totalSteps, prevStep, resetForm } = useCreatePractice();
  const { watch, setValue, handleSubmit } = form;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const values = watch();

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const onSubmit = async (data: typeof values) => {
    setIsSubmitting(true);

    try {
      const response = await createPractice(toCreatePracticeRequest(data));

      if (response.error) {
        const errorResponse = response.error as {
          error?: { message?: string };
          message?: string;
        };
        throw new Error(errorResponse.error?.message ?? errorResponse.message ?? "建立實踐失敗");
      }

      Alert.alert("建立成功", "你的實踐已建立，開始你的旅程吧！", [
        {
          text: "確定",
          onPress: () => {
            resetForm();
            router.replace("/(tabs)");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("建立失敗", error instanceof Error ? error.message : "請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const frequencyLabel = {
    daily: "每日",
    weekly: "每週",
    custom: "自訂",
  }[values.frequency];

  const privacyOptions: Array<{
    value: "private" | "public" | "delayed";
    label: string;
    description: string;
    Icon: typeof Lock;
  }> = [
    {
      value: "private",
      label: "私人",
      description: "只有你能看到",
      Icon: Lock,
    },
    {
      value: "public",
      label: "公開",
      description: "所有人都能在靈感頁看到",
      Icon: Eye,
    },
    {
      value: "delayed",
      label: "延遲分享",
      description: "進行中不顯示打卡內容，完成後解鎖",
      Icon: EyeOff,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button size="$4" circular chromeless onPress={handleBack} accessibilityLabel="返回">
            <ChevronLeft size={24} color="$color" />
          </Button>
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="600" color="$color">
              確認送出
            </Text>
            <Text fontSize={12} color="$color" opacity={0.6}>
              步驟 {currentStep} / {totalSteps}
            </Text>
          </YStack>
        </XStack>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$4">
            {/* Preview Card */}
            <YStack
              padding="$5"
              backgroundColor={values.color ? `${values.color}15` : colors.primary.palest}
              borderRadius="$md"
              borderWidth={1}
              borderColor={values.color ? `${values.color}30` : colors.primary.lighter}
              alignItems="center"
              gap="$3"
            >
              <YStack
                width={64}
                height={64}
                backgroundColor={values.color || colors.primary.base}
                borderRadius={32}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={28} color={colors.basic.white}>
                  {values.icon || "✨"}
                </Text>
              </YStack>
              <YStack alignItems="center" gap="$1">
                <Text fontSize={20} fontWeight="700" color="$color">
                  {values.title || "未命名實踐"}
                </Text>
                {values.description && (
                  <Text fontSize={13} color="$color" opacity={0.6} textAlign="center">
                    {values.description}
                  </Text>
                )}
              </YStack>
            </YStack>

            {/* Privacy Status */}
            <YStack gap="$3">
              <Text fontSize={15} fontWeight="600" color="$color">
                隱私設定
              </Text>
              {privacyOptions.map((opt) => {
                const isSelected = values.privacy_status === opt.value;
                return (
                  <RNPressable
                    key={opt.value}
                    onPress={() => setValue("privacy_status", opt.value)}
                  >
                    <XStack
                      padding="$3"
                      borderRadius="$md"
                      borderWidth={2}
                      borderColor={isSelected ? values.color || colors.primary.base : "#E5E7EB"}
                      backgroundColor={
                        isSelected
                          ? values.color
                            ? `${values.color}10`
                            : colors.primary.palest
                          : "white"
                      }
                      alignItems="center"
                      gap="$3"
                    >
                      <opt.Icon
                        size={20}
                        color={isSelected ? values.color || colors.primary.base : "#9CA3AF"}
                      />
                      <YStack flex={1}>
                        <Text fontSize={14} fontWeight="600" color="$color">
                          {opt.label}
                        </Text>
                        <Text fontSize={12} color="$color" opacity={0.6}>
                          {opt.description}
                        </Text>
                      </YStack>
                      {isSelected && (
                        <Check size={18} color={values.color || colors.primary.base} />
                      )}
                    </XStack>
                  </RNPressable>
                );
              })}
            </YStack>

            {/* Details */}
            <YStack padding="$4" backgroundColor={colors.basic[100]} borderRadius="$md" gap="$4">
              <XStack alignItems="center" gap="$3">
                <Calendar size={20} color={values.color || colors.primary.base} />
                <YStack flex={1}>
                  <Text fontSize={12} color="$color" opacity={0.6}>
                    執行頻率
                  </Text>
                  <Text fontSize={15} fontWeight="500" color="$color">
                    {frequencyLabel}
                  </Text>
                </YStack>
              </XStack>

              <XStack alignItems="center" gap="$3">
                <Target size={20} color={values.color || colors.primary.base} />
                <YStack flex={1}>
                  <Text fontSize={12} color="$color" opacity={0.6}>
                    目標天數
                  </Text>
                  <Text fontSize={15} fontWeight="500" color="$color">
                    {values.targetDays} 天
                  </Text>
                </YStack>
              </XStack>

              <XStack alignItems="center" gap="$3">
                <Bell size={20} color={values.color || colors.primary.base} />
                <YStack flex={1}>
                  <Text fontSize={12} color="$color" opacity={0.6}>
                    每日提醒
                  </Text>
                  <Text fontSize={15} fontWeight="500" color="$color">
                    {values.reminderEnabled ? `已開啟（${values.reminderTime}）` : "未開啟"}
                  </Text>
                </YStack>
              </XStack>

              {values.tags && values.tags.length > 0 && (
                <XStack alignItems="flex-start" gap="$3">
                  <Tag size={20} color={values.color || colors.primary.base} />
                  <YStack flex={1} gap="$2">
                    <Text fontSize={12} color="$color" opacity={0.6}>
                      標籤
                    </Text>
                    <XStack gap="$2" flexWrap="wrap">
                      {values.tags.map((tag) => (
                        <YStack
                          key={tag}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          backgroundColor={
                            values.color ? `${values.color}20` : colors.primary.palest
                          }
                          borderRadius="$sm"
                        >
                          <Text fontSize={12} color={values.color || colors.primary.base}>
                            {tag}
                          </Text>
                        </YStack>
                      ))}
                    </XStack>
                  </YStack>
                </XStack>
              )}
            </YStack>
          </YStack>
        </ScrollView>

        {/* Footer */}
        <YStack padding="$4" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            size="$5"
            backgroundColor={values.color || colors.primary.base}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner color={colors.basic.white} />
            ) : (
              <XStack alignItems="center" gap="$2">
                <Check size={20} color={colors.basic.white} />
                <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                  建立實踐
                </Text>
              </XStack>
            )}
          </Button>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
