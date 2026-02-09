import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Controller, useWatch } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, ScrollView, Text, TextArea, XStack, YStack } from "tamagui";
import { StepIndicator } from "@/components";
import { colors } from "@/generated/design-tokens";
import { useCreatePractice } from "@/providers/CreatePracticeProvider";

export default function Step1Screen() {
  const router = useRouter();
  const { form, currentStep, totalSteps, nextStep } = useCreatePractice();
  const {
    control,
    formState: { errors },
    trigger,
  } = form;

  // 使用 useWatch 避免整個組件重新渲染
  const titleLength = useWatch({ control, name: "title" })?.length || 0;
  const descriptionLength = useWatch({ control, name: "description" })?.length || 0;

  const handleNext = async () => {
    const isValid = await trigger(["title", "description"]);
    if (isValid) {
      nextStep();
      router.push("/practices/create/manual/step2");
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
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="600" color="$color">
              標題與描述
            </Text>
            <Text fontSize={12} color="$color" opacity={0.6}>
              步驟 {currentStep} / {totalSteps}
            </Text>
          </YStack>
        </XStack>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$5">
            {/* Title */}
            <YStack gap="$2">
              <XStack alignItems="center" gap="$1">
                <Text fontSize={14} fontWeight="500" color="$color">
                  實踐標題
                </Text>
                <Text fontSize={14} color={colors.semantic.error}>
                  *
                </Text>
              </XStack>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <Input
                    size="$4"
                    value={value}
                    onChangeText={onChange}
                    placeholder="例如：每日閱讀"
                    borderColor={errors.title ? colors.semantic.error : colors.basic[200]}
                    focusStyle={{
                      borderColor: errors.title ? colors.semantic.error : colors.primary.base,
                    }}
                    maxLength={50}
                  />
                )}
              />
              <XStack justifyContent="space-between">
                {errors.title ? (
                  <Text fontSize={12} color={colors.semantic.error}>
                    {errors.title.message}
                  </Text>
                ) : (
                  <YStack />
                )}
                <Text fontSize={11} color="$color" opacity={0.5}>
                  {titleLength}/50
                </Text>
              </XStack>
            </YStack>

            {/* Description */}
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="500" color="$color">
                描述（選填）
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextArea
                    size="$4"
                    value={value}
                    onChangeText={onChange}
                    placeholder="簡單描述這個實踐的目標..."
                    borderColor={errors.description ? colors.semantic.error : colors.basic[200]}
                    focusStyle={{
                      borderColor: errors.description ? colors.semantic.error : colors.primary.base,
                    }}
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={200}
                  />
                )}
              />
              <XStack justifyContent="space-between">
                {errors.description ? (
                  <Text fontSize={12} color={colors.semantic.error}>
                    {errors.description.message}
                  </Text>
                ) : (
                  <YStack />
                )}
                <Text fontSize={11} color="$color" opacity={0.5}>
                  {descriptionLength}/200
                </Text>
              </XStack>
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
