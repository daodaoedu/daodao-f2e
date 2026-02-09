import { Check, ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Controller } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, Text, XStack, YStack } from "tamagui";
import { StepIndicator } from "@/components";
import { colors } from "@/generated/design-tokens";
import { useCreatePractice } from "@/providers/CreatePracticeProvider";

const frequencyOptions = [
  { value: "daily", label: "每日", description: "每天執行一次" },
  { value: "weekly", label: "每週", description: "每週執行一次" },
  { value: "custom", label: "自訂", description: "選擇特定日子" },
] as const;

const targetDaysOptions = [7, 14, 21, 30, 60, 90, 100, 365];

const weekDays = [
  { value: 0, label: "日" },
  { value: 1, label: "一" },
  { value: 2, label: "二" },
  { value: 3, label: "三" },
  { value: 4, label: "四" },
  { value: 5, label: "五" },
  { value: 6, label: "六" },
];

export default function Step2Screen() {
  const router = useRouter();
  const { form, currentStep, totalSteps, nextStep, prevStep } = useCreatePractice();
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

  const frequency = watch("frequency");
  const customDays = watch("customDays") || [];

  const handleNext = async () => {
    const isValid = await trigger(["frequency", "targetDays", "customDays"]);
    if (isValid) {
      nextStep();
      router.push("/practices/create/manual/step3");
    }
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const toggleCustomDay = (day: number) => {
    const current = customDays || [];
    if (current.includes(day)) {
      setValue(
        "customDays",
        current.filter((d) => d !== day)
      );
    } else {
      setValue("customDays", [...current, day]);
    }
  };

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
              頻率與時長
            </Text>
            <Text fontSize={12} color="$color" opacity={0.6}>
              步驟 {currentStep} / {totalSteps}
            </Text>
          </YStack>
        </XStack>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$5">
            {/* Frequency */}
            <YStack gap="$3">
              <Text fontSize={14} fontWeight="500" color="$color">
                執行頻率
              </Text>
              <Controller
                control={control}
                name="frequency"
                render={({ field: { onChange, value } }) => (
                  <YStack gap="$2">
                    {frequencyOptions.map((option) => (
                      <Button
                        key={option.value}
                        size="$4"
                        backgroundColor={
                          value === option.value ? colors.primary.palest : "$background"
                        }
                        borderWidth={1}
                        borderColor={value === option.value ? colors.primary.base : "$borderColor"}
                        pressStyle={{ backgroundColor: colors.primary.palest }}
                        onPress={() => onChange(option.value)}
                      >
                        <XStack flex={1} justifyContent="space-between" alignItems="center">
                          <YStack>
                            <Text
                              fontSize={15}
                              fontWeight="500"
                              color={value === option.value ? colors.primary.darker : "$color"}
                            >
                              {option.label}
                            </Text>
                            <Text fontSize={12} color="$color" opacity={0.6}>
                              {option.description}
                            </Text>
                          </YStack>
                          {value === option.value && (
                            <Check size={20} color={colors.primary.base} />
                          )}
                        </XStack>
                      </Button>
                    ))}
                  </YStack>
                )}
              />
            </YStack>

            {/* Custom Days */}
            {frequency === "custom" && (
              <YStack gap="$3">
                <Text fontSize={14} fontWeight="500" color="$color">
                  選擇執行日
                </Text>
                <XStack gap="$2" justifyContent="space-between">
                  {weekDays.map((day) => (
                    <Button
                      key={day.value}
                      size="$4"
                      circular
                      width={44}
                      height={44}
                      backgroundColor={
                        customDays.includes(day.value) ? colors.primary.base : "$background"
                      }
                      borderWidth={1}
                      borderColor={
                        customDays.includes(day.value) ? colors.primary.base : "$borderColor"
                      }
                      onPress={() => toggleCustomDay(day.value)}
                    >
                      <Text
                        fontSize={14}
                        fontWeight="500"
                        color={customDays.includes(day.value) ? colors.basic.white : "$color"}
                      >
                        {day.label}
                      </Text>
                    </Button>
                  ))}
                </XStack>
              </YStack>
            )}

            {/* Target Days */}
            <YStack gap="$3">
              <Text fontSize={14} fontWeight="500" color="$color">
                目標天數
              </Text>
              <Controller
                control={control}
                name="targetDays"
                render={({ field: { onChange, value } }) => (
                  <XStack gap="$2" flexWrap="wrap">
                    {targetDaysOptions.map((days) => (
                      <Button
                        key={days}
                        size="$3"
                        backgroundColor={value === days ? colors.primary.base : "$background"}
                        borderWidth={1}
                        borderColor={value === days ? colors.primary.base : "$borderColor"}
                        pressStyle={{ backgroundColor: colors.primary.palest }}
                        onPress={() => onChange(days)}
                        marginBottom="$2"
                      >
                        <Text fontSize={14} color={value === days ? colors.basic.white : "$color"}>
                          {days} 天
                        </Text>
                      </Button>
                    ))}
                  </XStack>
                )}
              />
              {errors.targetDays && (
                <Text fontSize={12} color={colors.semantic.error}>
                  {errors.targetDays.message}
                </Text>
              )}
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
                下一步
              </Text>
              <ChevronRight size={20} color={colors.basic.white} />
            </XStack>
          </Button>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
