import { Bell, ChevronLeft, ChevronRight, Clock } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Controller } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, Switch, Text, XStack, YStack } from "tamagui";
import { StepIndicator } from "@/components";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { useCreatePractice } from "@/providers/CreatePracticeProvider";

const timeOptions = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
  "21:00",
  "22:00",
];

export default function Step3Screen() {
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");
  const { form, currentStep, totalSteps, nextStep, prevStep } = useCreatePractice();
  const { control, watch, setValue, trigger } = form;

  const reminderEnabled = watch("reminderEnabled");
  const reminderTime = watch("reminderTime");

  const handleNext = async () => {
    const isValid = await trigger(["reminderEnabled", "reminderTime"]);
    if (isValid) {
      nextStep();
      router.push("/practices/create/manual/step4");
    }
  };

  const handleBack = () => {
    prevStep();
    router.back();
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
              {t("mobile_step3_title")}
            </Text>
            <Text fontSize={12} color="$color" opacity={0.6}>
              {t("mobile_step_progress", { current: currentStep, total: totalSteps })}
            </Text>
          </YStack>
        </XStack>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$5">
            {/* Reminder Toggle */}
            <YStack
              padding="$4"
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <XStack gap="$3" alignItems="center">
                  <YStack
                    width={40}
                    height={40}
                    backgroundColor={colors.primary.palest}
                    borderRadius={20}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Bell size={20} color={colors.primary.base} />
                  </YStack>
                  <YStack>
                    <Text fontSize={15} fontWeight="500" color="$color">
                      {t("mobile_reminder_label")}
                    </Text>
                    <Text fontSize={12} color="$color" opacity={0.6}>
                      {t("mobile_reminder_description")}
                    </Text>
                  </YStack>
                </XStack>
                <Controller
                  control={control}
                  name="reminderEnabled"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      checked={value}
                      onCheckedChange={onChange}
                      backgroundColor={value ? colors.primary.base : colors.basic[300]}
                    >
                      <Switch.Thumb />
                    </Switch>
                  )}
                />
              </XStack>
            </YStack>

            {/* Reminder Time */}
            {reminderEnabled && (
              <YStack gap="$3">
                <XStack alignItems="center" gap="$2">
                  <Clock size={18} color="$color" />
                  <Text fontSize={14} fontWeight="500" color="$color">
                    {t("mobile_reminder_time_label")}
                  </Text>
                </XStack>
                <XStack gap="$2" flexWrap="wrap">
                  {timeOptions.map((time) => (
                    <Button
                      key={time}
                      size="$3"
                      backgroundColor={reminderTime === time ? colors.primary.base : "$background"}
                      borderWidth={1}
                      borderColor={reminderTime === time ? colors.primary.base : "$borderColor"}
                      pressStyle={{ backgroundColor: colors.primary.palest }}
                      onPress={() => setValue("reminderTime", time)}
                      marginBottom="$2"
                    >
                      <Text
                        fontSize={14}
                        color={reminderTime === time ? colors.basic.white : "$color"}
                      >
                        {time}
                      </Text>
                    </Button>
                  ))}
                </XStack>
              </YStack>
            )}

            {/* Info */}
            <YStack padding="$4" backgroundColor={colors.basic[100]} borderRadius="$md" gap="$2">
              <Text fontSize={13} color="$color" opacity={0.8}>
                {t("mobile_tip_title")}
              </Text>
              <Text fontSize={13} color="$color" opacity={0.6}>
                {t("mobile_reminder_tip")}
              </Text>
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
