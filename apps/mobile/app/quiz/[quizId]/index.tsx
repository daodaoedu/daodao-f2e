import { ChevronLeft, Clock, HelpCircle, Play } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { availableQuizzes } from "@/types/quiz";

export default function QuizStartScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const router = useRouter();

  const quiz = availableQuizzes.find((q) => q.id === quizId);

  if (!quiz) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Text fontSize={16} color="$color" opacity={0.6}>
            找不到此測驗
          </Text>
          <Button onPress={() => router.back()}>
            <Text>返回</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

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
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack alignItems="center" gap="$6" paddingVertical="$6">
            {/* Icon */}
            <YStack
              width={120}
              height={120}
              backgroundColor={colors.primary.palest}
              borderRadius={60}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={64}>{quiz.icon}</Text>
            </YStack>

            {/* Title & Description */}
            <YStack alignItems="center" gap="$3">
              <Text fontSize={24} fontWeight="700" color="$color" textAlign="center">
                {quiz.title}
              </Text>
              <Text fontSize={15} color="$color" opacity={0.6} textAlign="center">
                {quiz.description}
              </Text>
            </YStack>

            {/* Info */}
            <XStack gap="$6">
              <YStack alignItems="center" gap="$1">
                <XStack
                  width={48}
                  height={48}
                  backgroundColor={colors.basic[100]}
                  borderRadius={24}
                  alignItems="center"
                  justifyContent="center"
                >
                  <HelpCircle size={24} color={colors.primary.base} />
                </XStack>
                <Text fontSize={14} fontWeight="600" color="$color">
                  {quiz.questionCount} 題
                </Text>
                <Text fontSize={12} color="$color" opacity={0.5}>
                  問題數量
                </Text>
              </YStack>

              <YStack alignItems="center" gap="$1">
                <XStack
                  width={48}
                  height={48}
                  backgroundColor={colors.basic[100]}
                  borderRadius={24}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Clock size={24} color={colors.primary.base} />
                </XStack>
                <Text fontSize={14} fontWeight="600" color="$color">
                  {quiz.estimatedTime}
                </Text>
                <Text fontSize={12} color="$color" opacity={0.5}>
                  預估時間
                </Text>
              </YStack>
            </XStack>

            {/* Instructions */}
            <YStack
              width="100%"
              padding="$4"
              backgroundColor={colors.basic[100]}
              borderRadius="$md"
              gap="$2"
            >
              <Text fontSize={14} fontWeight="600" color="$color">
                測驗說明
              </Text>
              <YStack gap="$1">
                <Text fontSize={13} color="$color" opacity={0.7}>
                  • 請根據你的第一直覺作答
                </Text>
                <Text fontSize={13} color="$color" opacity={0.7}>
                  • 沒有對錯之分，選擇最符合你的選項
                </Text>
                <Text fontSize={13} color="$color" opacity={0.7}>
                  • 完成後將獲得專屬的學習島嶼結果
                </Text>
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Footer */}
        <YStack padding="$4" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            size="$5"
            backgroundColor={colors.primary.base}
            pressStyle={{ opacity: 0.8 }}
            onPress={() => router.push(`/quiz/${quizId}/questions`)}
          >
            <XStack alignItems="center" gap="$2">
              <Play size={20} color={colors.basic.white} />
              <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                開始測驗
              </Text>
            </XStack>
          </Button>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
