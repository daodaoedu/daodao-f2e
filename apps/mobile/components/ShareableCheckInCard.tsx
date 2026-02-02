import { Check, Flame } from "@tamagui/lucide-icons";
import { forwardRef } from "react";
import { View } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import type { Practice } from "@/types/practice";

interface ShareableCheckInCardProps {
  practice: Practice;
  streakCount: number;
  date?: Date;
}

export const ShareableCheckInCard = forwardRef<View, ShareableCheckInCardProps>(
  function ShareableCheckInCard({ practice, streakCount, date = new Date() }, ref) {
    const formattedDate = date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const cardColor = practice.color || colors.primary.base;

    return (
      <View ref={ref} collapsable={false}>
        <YStack
          width={320}
          padding="$5"
          backgroundColor={colors.basic.white}
          borderRadius="$lg"
          gap="$4"
          shadowColor={colors.basic.black}
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={8}
        >
          {/* Header with Logo */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={12} color={colors.basic[400]}>
              {formattedDate}
            </Text>
            <Text fontSize={14} fontWeight="700" color={colors.primary.base}>
              島島阿學
            </Text>
          </XStack>

          {/* Main Content */}
          <YStack alignItems="center" gap="$4" paddingVertical="$4">
            {/* Success Icon */}
            <YStack
              width={80}
              height={80}
              backgroundColor={colors.semantic.success}
              borderRadius={40}
              alignItems="center"
              justifyContent="center"
            >
              <Check size={40} color={colors.basic.white} />
            </YStack>

            {/* Practice Title */}
            <YStack alignItems="center" gap="$1">
              <Text fontSize={20} fontWeight="700" color={colors.basic.black} textAlign="center">
                {practice.title}
              </Text>
              {practice.description && (
                <Text fontSize={13} color={colors.basic[500]} textAlign="center" numberOfLines={2}>
                  {practice.description}
                </Text>
              )}
            </YStack>
          </YStack>

          {/* Streak Badge */}
          <XStack
            backgroundColor={`${cardColor}15`}
            padding="$3"
            borderRadius="$md"
            justifyContent="center"
            alignItems="center"
            gap="$2"
          >
            <Flame size={24} color={colors.semantic.warning} />
            <Text fontSize={18} fontWeight="700" color={cardColor}>
              連續打卡 {streakCount} 天
            </Text>
          </XStack>

          {/* Progress */}
          <YStack gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={13} color={colors.basic[500]}>
                目標進度
              </Text>
              <Text fontSize={13} fontWeight="600" color={cardColor}>
                {practice.completedDays} / {practice.targetDays} 天
              </Text>
            </XStack>
            <YStack
              height={8}
              backgroundColor={colors.basic[100]}
              borderRadius={4}
              overflow="hidden"
            >
              <YStack
                height="100%"
                width={`${Math.min((practice.completedDays / practice.targetDays) * 100, 100)}%`}
                backgroundColor={cardColor}
                borderRadius={4}
              />
            </YStack>
          </YStack>

          {/* Footer */}
          <XStack justifyContent="center" paddingTop="$2">
            <Text fontSize={11} color={colors.basic[400]}>
              daodao.edu.tw
            </Text>
          </XStack>
        </YStack>
      </View>
    );
  }
);
