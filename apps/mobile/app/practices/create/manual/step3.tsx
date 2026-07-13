import { Clock } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Controller, useWatch } from "react-hook-form";
import { Input, Text, XStack, YStack } from "tamagui";
import { DurationMinutesSlider } from "@/components/practice/create/manual/DurationMinutesSlider";
import { ManualStepShell } from "@/components/practice/create/manual/ManualStepShell";
import { EXECUTION_TIMING_OPTIONS } from "@/components/practice/create/manual/schema";
import type { ExecutionTiming } from "@/constants/practice-form";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { useCreatePractice } from "@/providers/CreatePracticeProvider";

const CUSTOM_TIMING_MAX = 20;

export default function Step3Screen() {
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const { form, currentStep, totalSteps, nextStep, prevStep } = useCreatePractice();
  const {
    control,
    trigger,
    formState: { errors },
  } = form;
  const cyan = colors.logo.cyan;

  const name = useWatch({ control, name: "name" });
  const actionDescription = useWatch({ control, name: "actionDescription" });

  const handleNext = async () => {
    if (await trigger(["durationMinutes", "executionTiming", "customTiming"])) {
      nextStep();
      router.push("/practices/create/manual/step4");
    }
  };

  const handlePrev = () => {
    prevStep();
    router.back();
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
        {/* Duration per session（滑桿 + 標籤） */}
        <YStack gap="$4">
          <XStack alignItems="center" gap="$1">
            <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
              {t("form_session_duration")}
            </Text>
            <Text fontSize={16} color={colors.semantic.error}>
              *
            </Text>
          </XStack>
          <Controller
            control={control}
            name="durationMinutes"
            render={({ field: { onChange, value } }) => (
              <DurationMinutesSlider value={value} onChange={onChange} />
            )}
          />
        </YStack>

        {/* Execution Timing（多選格狀卡片） */}
        <YStack gap="$3">
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
              {t("form_execution_timing")}
            </Text>
            <Text fontSize={13} color={colors.text.muted}>
              {t("form_execution_timing_multi")}
            </Text>
          </XStack>
          <Controller
            control={control}
            name="executionTiming"
            render={({ field: { onChange, value } }) => {
              const selectedList: ExecutionTiming[] = value ?? [];
              const toggle = (v: ExecutionTiming) => {
                onChange(
                  selectedList.includes(v)
                    ? selectedList.filter((x) => x !== v)
                    : [...selectedList, v]
                );
              };
              // 與 product step-3 相同：3 欄 grid、選取 cyan 邊框、未選透明邊框
              return (
                <XStack flexWrap="wrap" gap={12}>
                  {EXECUTION_TIMING_OPTIONS.map((option) => {
                    const selected = selectedList.includes(option.value);
                    return (
                      <YStack
                        key={option.value}
                        // 3 欄：寬度 = (100% - 2 gaps) / 3
                        width="31%"
                        flexGrow={0}
                        flexShrink={0}
                        alignItems="center"
                        justifyContent="center"
                        paddingVertical={18}
                        paddingHorizontal={4}
                        borderRadius={8}
                        borderWidth={1}
                        backgroundColor={colors.basic.white}
                        // mobile 無背景動效，未選用 bg-gray 邊框避免與白底融合
                        borderColor={selected ? cyan : colors.gray.light}
                        pressStyle={{ backgroundColor: colors.background.lightCyan }}
                        onPress={() => toggle(option.value)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                        accessibilityLabel={t(option.labelKey)}
                      >
                        <Text
                          fontSize={14}
                          fontWeight="500"
                          color={selected ? cyan : colors.text.dark}
                          numberOfLines={1}
                        >
                          {t(option.labelKey)}
                        </Text>
                      </YStack>
                    );
                  })}
                </XStack>
              );
            }}
          />
          {errors.executionTiming && (
            <Text fontSize={12} color={colors.semantic.error}>
              {errors.executionTiming.message}
            </Text>
          )}
        </YStack>

        {/* Other time */}
        <YStack gap="$3">
          <Text fontSize={14} color={colors.text.dark}>
            {t("form_custom_timing")}
          </Text>
          <Controller
            control={control}
            name="customTiming"
            render={({ field: { onChange, onBlur, value } }) => (
              <XStack
                alignItems="center"
                gap="$2"
                paddingHorizontal="$3"
                borderRadius={8}
                borderWidth={1}
                borderColor={colors.gray.light}
                backgroundColor={colors.basic.white}
              >
                <Clock size={18} color={colors.text.muted} />
                <Input
                  flex={1}
                  unstyled
                  paddingVertical="$3"
                  fontSize={15}
                  color={colors.text.dark}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t("form_custom_timing_placeholder")}
                  placeholderTextColor={colors.text.muted}
                  maxLength={CUSTOM_TIMING_MAX}
                />
              </XStack>
            )}
          />
        </YStack>
      </YStack>
    </ManualStepShell>
  );
}
