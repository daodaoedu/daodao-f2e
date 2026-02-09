import { Check } from "@tamagui/lucide-icons";
import { Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <XStack justifyContent="center" alignItems="center" gap="$2" paddingVertical="$3">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <XStack key={step} alignItems="center" gap="$2">
            <YStack
              width={28}
              height={28}
              borderRadius={14}
              backgroundColor={
                isCompleted
                  ? colors.primary.base
                  : isCurrent
                    ? colors.primary.base
                    : colors.basic[200]
              }
              alignItems="center"
              justifyContent="center"
            >
              {isCompleted ? (
                <Check size={16} color={colors.basic.white} />
              ) : (
                <Text
                  fontSize={12}
                  fontWeight="600"
                  color={isCurrent ? colors.basic.white : colors.basic[400]}
                >
                  {step}
                </Text>
              )}
            </YStack>
            {step < totalSteps && (
              <YStack
                width={24}
                height={2}
                backgroundColor={isCompleted ? colors.primary.base : colors.basic[200]}
                borderRadius={1}
              />
            )}
          </XStack>
        );
      })}
    </XStack>
  );
}
