import { Check, ChevronRight, X } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { mockQuestions, type IQuizAnswer } from "@/types/quiz";

export default function QuizQuestionsScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const router = useRouter();

  const questions = mockQuestions.filter((q) => q.quizId === quizId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<IQuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelectOption = (optionId: string, _value: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = useCallback(() => {
    if (!selectedOption || !currentQuestion) return;

    const option = currentQuestion.options.find((o) => o.id === selectedOption);
    if (!option) return;

    const newAnswer: IQuizAnswer = {
      questionId: currentQuestion.id,
      optionId: selectedOption,
      value: option.value,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (isLastQuestion) {
      // Navigate to result with answers
      router.replace({
        pathname: "/quiz/[quizId]/result",
        params: { quizId: quizId as string, answers: JSON.stringify(updatedAnswers) },
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  }, [selectedOption, currentQuestion, answers, isLastQuestion, quizId, router]);

  const handleExit = () => {
    router.back();
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Text fontSize={16} color="$color" opacity={0.6}>
            沒有找到題目
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
        <XStack padding="$4" justifyContent="space-between" alignItems="center">
          <Button size="$4" circular chromeless onPress={handleExit} accessibilityLabel="離開測驗">
            <X size={24} color="$color" />
          </Button>
          <Text fontSize={14} color="$color" opacity={0.6}>
            {currentIndex + 1} / {questions.length}
          </Text>
          <YStack width={40} />
        </XStack>

        {/* Progress Bar */}
        <YStack paddingHorizontal="$4">
          <YStack height={4} backgroundColor={colors.basic[200]} borderRadius={2} overflow="hidden">
            <YStack
              height="100%"
              width={`${progress}%`}
              backgroundColor={colors.primary.base}
              borderRadius={2}
            />
          </YStack>
        </YStack>

        {/* Question */}
        <YStack flex={1} padding="$4" gap="$6">
          <YStack gap="$2" paddingVertical="$4">
            <Text fontSize={22} fontWeight="700" color="$color" lineHeight={32}>
              {currentQuestion.question}
            </Text>
          </YStack>

          {/* Options */}
          <YStack gap="$3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === option.id;
              return (
                <Button
                  key={option.id}
                  size="$5"
                  backgroundColor={isSelected ? colors.primary.palest : "$background"}
                  borderWidth={2}
                  borderColor={isSelected ? colors.primary.base : "$borderColor"}
                  pressStyle={{ backgroundColor: colors.primary.palest }}
                  onPress={() => handleSelectOption(option.id, option.value)}
                  justifyContent="flex-start"
                  paddingHorizontal="$4"
                >
                  <XStack flex={1} alignItems="center" gap="$3">
                    <YStack
                      width={28}
                      height={28}
                      borderRadius={14}
                      backgroundColor={isSelected ? colors.primary.base : colors.basic[200]}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isSelected ? (
                        <Check size={16} color={colors.basic.white} />
                      ) : (
                        <Text fontSize={13} fontWeight="600" color={colors.basic[500]}>
                          {String.fromCharCode(65 + index)}
                        </Text>
                      )}
                    </YStack>
                    <Text
                      flex={1}
                      fontSize={15}
                      color={isSelected ? colors.primary.darker : "$color"}
                      fontWeight={isSelected ? "600" : "400"}
                    >
                      {option.text}
                    </Text>
                  </XStack>
                </Button>
              );
            })}
          </YStack>
        </YStack>

        {/* Footer */}
        <YStack padding="$4" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            size="$5"
            backgroundColor={selectedOption ? colors.primary.base : colors.basic[300]}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleNext}
            disabled={!selectedOption}
          >
            <XStack alignItems="center" gap="$2">
              <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                {isLastQuestion ? "完成測驗" : "下一題"}
              </Text>
              <ChevronRight size={20} color={colors.basic.white} />
            </XStack>
          </Button>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
