import { useRouter } from "expo-router";
import { Controller, useWatch } from "react-hook-form";
import { Text, XStack, YStack } from "tamagui";
import { ManualDatePicker } from "@/components/practice/create/manual/ManualDatePicker";
import { ManualStepShell } from "@/components/practice/create/manual/ManualStepShell";
import {
  DURATION_DAYS_OPTIONS,
  FREQUENCY_OPTIONS,
} from "@/components/practice/create/manual/schema";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { useCreatePractice } from "@/providers/CreatePracticeProvider";

const RANGE_DAYS = 14;

const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const computeEndDate = (startDate: string, durationDays: string): string => {
  if (!startDate || !durationDays) return "";
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "";
  const end = new Date(start);
  end.setDate(start.getDate() + Number.parseInt(durationDays, 10));
  const y = end.getFullYear();
  const m = String(end.getMonth() + 1).padStart(2, "0");
  const d = String(end.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
};

const RequiredLabel = ({ text }: { text: string }) => (
  <XStack alignItems="center" gap="$1" marginBottom="$3">
    <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
      {text}
    </Text>
    <Text fontSize={16} color={colors.semantic.error}>
      *
    </Text>
  </XStack>
);

export default function Step2Screen() {
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
  const startDate = useWatch({ control, name: "startDate" });
  const durationDays = useWatch({ control, name: "durationDays" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + RANGE_DAYS);
  const endDate = computeEndDate(startDate, durationDays);

  const handleNext = async () => {
    if (await trigger(["startDate", "durationDays", "frequency"])) {
      nextStep();
      router.push("/practices/create/manual/step3");
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
      <YStack gap="$5">
        {/* Start Date */}
        <YStack>
          <RequiredLabel text={t("form_start_date")} />
          <Controller
            control={control}
            name="startDate"
            render={({ field: { onChange, value } }) => (
              <ManualDatePicker
                value={value}
                onChange={onChange}
                minDate={toDateString(today)}
                maxDate={toDateString(maxDate)}
                placeholder={t("form_start_date_placeholder")}
                invalid={!!errors.startDate}
              />
            )}
          />
          {errors.startDate && (
            <Text fontSize={13} color={colors.semantic.error} marginTop="$2">
              {errors.startDate.message}
            </Text>
          )}
        </YStack>

        {/* Duration Days（四欄卡片） */}
        <YStack>
          <RequiredLabel text={t("form_duration")} />
          <Controller
            control={control}
            name="durationDays"
            render={({ field: { onChange, value } }) => (
              <XStack gap="$3">
                {DURATION_DAYS_OPTIONS.map((option) => {
                  const selected = value === option.value;
                  return (
                    <YStack
                      key={option.value}
                      flex={1}
                      alignItems="center"
                      justifyContent="center"
                      paddingVertical={16}
                      borderRadius={8}
                      borderWidth={1}
                      backgroundColor={colors.basic.white}
                      // product web 未選 transparent，但 mobile 無背景動效易與白底融合 → 用 bg-gray 邊框
                      borderColor={selected ? cyan : colors.gray.light}
                      pressStyle={{ backgroundColor: colors.background.lightCyan }}
                      onPress={() => onChange(option.value)}
                    >
                      <Text
                        fontSize={16}
                        fontWeight="500"
                        color={selected ? cyan : colors.text.dark}
                      >
                        {t(option.labelKey)}
                      </Text>
                    </YStack>
                  );
                })}
              </XStack>
            )}
          />
          {startDate && durationDays && endDate && (
            <Text fontSize={14} color={colors.text.dark} marginTop="$2">
              {t("form_end_date", { date: endDate })}
            </Text>
          )}
          {errors.durationDays && (
            <Text fontSize={13} color={colors.semantic.error} marginTop="$2">
              {errors.durationDays.message}
            </Text>
          )}
        </YStack>

        {/* Frequency（三欄卡片：次數 + 單位 + 描述） */}
        <YStack>
          <RequiredLabel text={t("form_frequency")} />
          <Controller
            control={control}
            name="frequency"
            render={({ field: { onChange, value } }) => (
              <XStack gap="$3">
                {FREQUENCY_OPTIONS.map((option) => {
                  const selected = value === option.value;
                  const color = selected ? cyan : colors.text.dark;
                  return (
                    <YStack
                      key={option.value}
                      flex={1}
                      gap="$1"
                      alignItems="center"
                      justifyContent="center"
                      paddingVertical={12}
                      borderRadius={8}
                      borderWidth={1}
                      backgroundColor={colors.basic.white}
                      borderColor={selected ? cyan : colors.gray.light}
                      pressStyle={{ backgroundColor: colors.background.lightCyan }}
                      onPress={() => onChange(option.value)}
                    >
                      <XStack alignItems="baseline" gap="$1">
                        <Text fontSize={15} fontWeight="600" color={color}>
                          {option.label}
                        </Text>
                        <Text fontSize={13} color={color}>
                          {t(option.unitKey)}
                        </Text>
                      </XStack>
                      <Text fontSize={12} color={color} textAlign="center">
                        {t(option.descriptionKey)}
                      </Text>
                    </YStack>
                  );
                })}
              </XStack>
            )}
          />
          {errors.frequency && (
            <Text fontSize={13} color={colors.semantic.error} marginTop="$2">
              {errors.frequency.message}
            </Text>
          )}
        </YStack>
      </YStack>
    </ManualStepShell>
  );
}
