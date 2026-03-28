import { Home, RotateCcw, Share2 } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { type IIslandResult, mockIslandResults } from "@/types/quiz";

export default function QuizResultScreen() {
  const { quizId } = useLocalSearchParams<{
    quizId: string;
    answers?: string;
  }>();
  const router = useRouter();

  const [result, setResult] = useState<IIslandResult | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Simulate result calculation
    const timer = setTimeout(() => {
      // In real app, calculate based on answers
      const randomIndex = Math.floor(Math.random() * mockIslandResults.length);
      setResult(mockIslandResults[randomIndex]);
      setShowAnimation(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showAnimation || !result) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
          <YStack alignItems="center" gap="$4">
            <Text fontSize={64}>🏝️</Text>
            <Text fontSize={18} fontWeight="600" color="$color">
              正在分析你的答案...
            </Text>
            <Text fontSize={14} color="$color" opacity={0.6}>
              發現你的專屬學習島嶼
            </Text>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack alignItems="center" gap="$6" paddingVertical="$4">
            {/* Result Header */}
            <YStack alignItems="center" gap="$2">
              <Text fontSize={14} color="$color" opacity={0.6}>
                你的學習島嶼是
              </Text>
            </YStack>

            {/* Island Card */}
            <YStack
              width="100%"
              padding="$6"
              backgroundColor={`${result.color}15`}
              borderRadius="$md"
              borderWidth={2}
              borderColor={`${result.color}30`}
              alignItems="center"
              gap="$4"
            >
              <YStack
                width={100}
                height={100}
                backgroundColor={result.color}
                borderRadius={50}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={56}>{result.icon}</Text>
              </YStack>

              <YStack alignItems="center" gap="$2">
                <Text fontSize={28} fontWeight="700" color={result.color}>
                  {result.name}
                </Text>
                <Text fontSize={15} color="$color" opacity={0.7} textAlign="center">
                  {result.description}
                </Text>
              </YStack>
            </YStack>

            {/* Traits */}
            <YStack width="100%" gap="$3">
              <Text fontSize={16} fontWeight="600" color="$color">
                你的特質
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {result.traits.map((trait) => (
                  <YStack
                    key={trait}
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    backgroundColor={`${result.color}15`}
                    borderRadius="$sm"
                  >
                    <Text fontSize={14} color={result.color} fontWeight="500">
                      {trait}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </YStack>

            {/* Recommendations */}
            <YStack width="100%" gap="$3">
              <Text fontSize={16} fontWeight="600" color="$color">
                推薦實踐
              </Text>
              <YStack padding="$4" backgroundColor={colors.basic[100]} borderRadius="$md" gap="$2">
                {result.recommendations.map((rec, index) => (
                  <XStack key={rec} alignItems="center" gap="$2">
                    <YStack
                      width={24}
                      height={24}
                      backgroundColor={result.color}
                      borderRadius={12}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={12} color={colors.basic.white} fontWeight="600">
                        {index + 1}
                      </Text>
                    </YStack>
                    <Text fontSize={14} color="$color">
                      {rec}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Footer */}
        <YStack padding="$4" gap="$3" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            size="$5"
            backgroundColor={result.color}
            pressStyle={{ opacity: 0.8 }}
            onPress={() => router.replace("/(tabs)")}
          >
            <XStack alignItems="center" gap="$2">
              <Home size={20} color={colors.basic.white} />
              <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                開始我的學習之旅
              </Text>
            </XStack>
          </Button>

          <XStack gap="$3">
            <Button
              flex={1}
              size="$4"
              backgroundColor="transparent"
              borderWidth={1}
              borderColor="$borderColor"
              onPress={() => router.replace(`/quiz/${quizId}`)}
            >
              <XStack alignItems="center" gap="$2">
                <RotateCcw size={18} color="$color" />
                <Text color="$color">重新測驗</Text>
              </XStack>
            </Button>

            <Button
              flex={1}
              size="$4"
              backgroundColor="transparent"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <XStack alignItems="center" gap="$2">
                <Share2 size={18} color="$color" />
                <Text color="$color">分享結果</Text>
              </XStack>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
