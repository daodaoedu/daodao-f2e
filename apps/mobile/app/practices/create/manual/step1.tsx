import { useRouter } from "expo-router";
import { Controller, useWatch } from "react-hook-form";
import { Input, Text, TextArea, XStack, YStack } from "tamagui";
import { ManualStepShell } from "@/components/practice/create/manual/ManualStepShell";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { useCreatePractice } from "@/providers/CreatePracticeProvider";

const NAME_MAX = 20;
const ACTION_MAX = 50;

export default function Step1Screen() {
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const { form, currentStep, totalSteps, nextStep } = useCreatePractice();
  const {
    control,
    formState: { errors },
    trigger,
  } = form;

  const nameLength = useWatch({ control, name: "name" })?.length || 0;
  const actionLength = useWatch({ control, name: "actionDescription" })?.length || 0;

  const handlePrev = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleNext = async () => {
    if (await trigger(["name", "actionDescription"])) {
      nextStep();
      router.push("/practices/create/manual/step2");
    }
  };

  return (
    <ManualStepShell
      step={currentStep}
      totalSteps={totalSteps}
      title={t("manual_create_title")}
      onPrev={handlePrev}
      onNext={handleNext}
      nextLabel={t("manual_next_step")}
    >
      <YStack gap="$5">
        {/* Name */}
        <YStack gap="$2">
          <XStack alignItems="center" gap="$1">
            <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
              {t("manual_step_name_label")}
            </Text>
            <Text fontSize={16} color={colors.semantic.error}>
              *
            </Text>
          </XStack>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                size="$4"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t("manual_step_name_placeholder")}
                backgroundColor={colors.basic.white}
                // 對齊 product Input：border-bg-gray（colors.gray.light）
                borderColor={errors.name ? colors.semantic.error : colors.gray.light}
                focusStyle={{
                  borderColor: errors.name ? colors.semantic.error : colors.logo.cyan,
                }}
                maxLength={NAME_MAX}
              />
            )}
          />
          <XStack justifyContent="space-between">
            {errors.name ? (
              <Text fontSize={12} color={colors.semantic.error}>
                {errors.name.message}
              </Text>
            ) : (
              <YStack />
            )}
            <Text fontSize={11} color={colors.text.muted}>
              {nameLength}/{NAME_MAX}
            </Text>
          </XStack>
        </YStack>

        {/* Action Description */}
        <YStack gap="$2">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$1">
              <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
                {t("manual_step_action_label")}
              </Text>
              <Text fontSize={16} color={colors.semantic.error}>
                *
              </Text>
            </XStack>
            <Text fontSize={13} color={colors.text.muted}>
              {actionLength}/{ACTION_MAX}
            </Text>
          </XStack>
          <Controller
            control={control}
            name="actionDescription"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextArea
                size="$4"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t("manual_step_action_placeholder")}
                backgroundColor={colors.basic.white}
                borderColor={errors.actionDescription ? colors.semantic.error : colors.gray.light}
                focusStyle={{
                  borderColor: errors.actionDescription ? colors.semantic.error : colors.logo.cyan,
                }}
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={ACTION_MAX}
              />
            )}
          />
          {errors.actionDescription && (
            <Text fontSize={12} color={colors.semantic.error}>
              {errors.actionDescription.message}
            </Text>
          )}
        </YStack>
      </YStack>
    </ManualStepShell>
  );
}
