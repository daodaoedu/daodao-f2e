import {
  type CreatePracticeRequestType,
  createPractice,
  extractApiErrorMessage,
} from "@daodao/api";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, type LayoutChangeEvent, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import {
  BgFloatIconsLayer,
  type DecorationAnchor,
  BgRadialLayer,
} from "@/components/practice/create/manual/BgRadialDecoration";
import { ManualStepShell } from "@/components/practice/create/manual/ManualStepShell";
import type { ManualPracticeFormValuesType } from "@/components/practice/create/manual/schema";
import {
  ExecutionDurationCard,
  ExecutionTimingCard,
  PracticeOverviewCard,
  ResourceCard,
  ResourceGrid,
} from "@/components/practice/shared";
import { PrivacyStatusSelector } from "@/components/practice/shared/privacy-status-selector";
import {
  type ExecutionTiming,
  type Frequency,
  mapExecutionTimingToPracticeTimePeriods,
  parseFrequency,
} from "@/constants/practice-form";
import { colors } from "@/generated/design-tokens";
import { applyOnboardingUpdateFromResponse } from "@/hooks/useOnboardingProgress";
import { useMobileTranslation } from "@/i18n";
import { useCreatePractice } from "@/providers/CreatePracticeProvider";

/**
 * 將表單資料轉換成 API 請求格式。
 * 對齊 product `convertFormValuesToApiRequest`。
 */
const convertFormValuesToApiRequest = (
  values: ManualPracticeFormValuesType
): CreatePracticeRequestType => {
  const frequency = parseFrequency(values.frequency as Frequency);
  const practiceTimePeriods = mapExecutionTimingToPracticeTimePeriods(
    values.executionTiming as ExecutionTiming[]
  );

  const request: Record<string, unknown> = {
    title: values.name,
    durationDays: Number.parseInt(values.durationDays, 10),
    frequencyMinDays: frequency.minDays,
    frequencyMaxDays: frequency.maxDays,
    sessionDurationMinutes: values.durationMinutes,
  };

  if (values.actionDescription) {
    request.practiceAction = values.actionDescription;
  }
  if (values.startDate) {
    request.startDate = values.startDate;
  }
  if (practiceTimePeriods.length > 0) {
    request.practiceTimePeriods = practiceTimePeriods;
  }
  if (values.customTiming) {
    request.otherContext = values.customTiming;
  }
  if (values.tags && values.tags.length > 0) {
    request.tags = values.tags;
  }
  if (values.resources && values.resources.length > 0) {
    request.resources = values.resources.map((resource) => ({
      name: resource.name,
      url: resource.url || undefined,
    }));
  }

  return request as CreatePracticeRequestType;
};

/**
 * Step5 預覽 — 對齊 product `steps/step-5.tsx`。
 *
 * 裝飾分層（對齊 product BgRadialAnimation，RN sibling zIndex）：
 * - radial：最底（product -z-10）
 * - 內容（標題 + 卡片）：中層
 * - notebook / compass：最上（product z-10），壓在 overview card 上不被裁切
 */
export default function Step5Screen() {
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const appProductT = useMobileTranslation("app_product");
  const { form, currentStep, totalSteps, prevStep, resetForm, privacyStatus, setPrivacyStatus } =
    useCreatePractice();
  const { watch, handleSubmit } = form;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameAnchor, setNameAnchor] = useState<DecorationAnchor | null>(null);

  const rootRef = useRef<View>(null);
  const nameRef = useRef<View>(null);

  const values = watch();
  const resources = values.resources ?? [];

  /** 量測實踐名稱中心相對 root，供兩層裝飾共用錨點 */
  const measureNameAnchor = useCallback(() => {
    const root = rootRef.current;
    const name = nameRef.current;
    if (!root || !name) return;

    name.measureLayout(
      // biome-ignore lint/suspicious/noExplicitAny: RN measureLayout native node
      root as any,
      (x, y, width, height) => {
        setNameAnchor({
          centerX: x + width / 2,
          centerY: y + height / 2,
        });
      },
      () => {
        /* measure failed — keep previous anchor */
      }
    );
  }, []);

  const onNameLayout = useCallback(
    (_e: LayoutChangeEvent) => {
      // layout 完成後再 measureLayout，確保相對 root 座標正確
      requestAnimationFrame(measureNameAnchor);
    },
    [measureNameAnchor]
  );

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const onSubmit = async (data: ManualPracticeFormValuesType) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const request = {
        ...convertFormValuesToApiRequest(data),
        privacyStatus,
      } as CreatePracticeRequestType;

      const response = await createPractice(request);

      if (response.error) {
        throw new Error(extractApiErrorMessage(response.error, t("create_failed")));
      }

      applyOnboardingUpdateFromResponse(response.data);

      const practiceId = response.data?.data?.id;
      resetForm();
      router.replace(
        practiceId
          ? `/practices/create/success?practiceId=${practiceId}`
          : "/practices/create/success"
      );
    } catch (error) {
      Alert.alert(
        t("create_failed"),
        error instanceof Error ? error.message : t("create_failed_retry")
      );
      setIsSubmitting(false);
    }
  };

  return (
    <ManualStepShell
      step={currentStep}
      totalSteps={totalSteps}
      hideProgress
      onPrev={handleBack}
      onNext={handleSubmit(onSubmit)}
      nextLabel={t("manual_finish")}
      isSubmitting={isSubmitting}
    >
      {/*
        分層 root（RN sibling zIndex）：
        0 radial 背景最底
        1 內容（標題 + 卡片 + 隱私）
        10 float icons 最上（指南針可完整壓在 card 上）
      */}
      <View ref={rootRef} style={{ position: "relative", overflow: "visible" }} collapsable={false}>
        {/* Layer 0：白放射線 — product -z-10 */}
        <BgRadialLayer anchor={nameAnchor} />

        {/* Layer 1：內容 */}
        <YStack zIndex={1} gap={0}>
          <YStack alignItems="center" paddingTop={16} paddingBottom={16} overflow="visible">
            <Text fontSize={14} color={colors.text.dark} marginBottom={4}>
              {appProductT("practice_created_is")}
            </Text>
            {/* h1 錨點：量測此盒中心 */}
            <View
              ref={nameRef}
              collapsable={false}
              onLayout={onNameLayout}
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                minHeight: 40,
              }}
            >
              <Text
                fontSize={28}
                lineHeight={36}
                fontWeight="500"
                color={colors.text.dark}
                textAlign="center"
                minHeight={36}
                paddingHorizontal={32}
              >
                {values.name || " "}
              </Text>
            </View>
          </YStack>

          <YStack gap={14} paddingTop={16} paddingBottom={8}>
            <PracticeOverviewCard
              actionDescription={values.actionDescription}
              frequency={values.frequency}
              durationMinutes={values.durationMinutes}
              tags={values.tags}
            />

            <XStack gap={16} alignItems="stretch">
              <YStack flex={1} minWidth={0}>
                <ExecutionTimingCard
                  executionTiming={values.executionTiming}
                  customTiming={values.customTiming}
                />
              </YStack>
              <YStack flex={1} minWidth={0}>
                <ExecutionDurationCard
                  durationDays={values.durationDays}
                  startDate={values.startDate}
                />
              </YStack>
            </XStack>
          </YStack>

          {resources.length > 0 && (
            <YStack gap={14} marginTop={16}>
              <Text fontSize={14} fontWeight="500" color={colors.text.dark} textAlign="center">
                {appProductT("practice_resource_intro")}
              </Text>
              <ResourceGrid>
                {resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </ResourceGrid>
            </YStack>
          )}

          <YStack
            marginTop={24}
            marginBottom={24}
            padding={16}
            backgroundColor={colors.basic.white}
            borderRadius={8}
            shadowColor="#0D3036"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.08}
            shadowRadius={4}
            elevation={2}
          >
            <PrivacyStatusSelector value={privacyStatus} onChange={setPrivacyStatus} />
          </YStack>
        </YStack>

        {/* Layer 10：notebook + compass — product z-10 */}
        <BgFloatIconsLayer anchor={nameAnchor} />
      </View>
    </ManualStepShell>
  );
}
