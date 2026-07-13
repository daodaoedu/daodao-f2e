import { usePersonaProfileMe, usePersonaQuestions } from "@daodao/api";
import { Lock } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Card, Spinner, Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { useAuth } from "@/providers/AuthProvider";

interface PersonaQuestionSummary {
  id: number;
  prompt: string;
  answer: {
    selectedValue: string | null;
    textAnswer: string | null;
    resonanceCount: number;
  } | null;
}

/**
 * 學習人物誌內容區。
 *
 * 對齊 product 的 PersonaProfileMe：不含頁面外框（SafeAreaView / 返回列 / ScrollView），
 * 純內容區塊，供 /persona 整頁與 My Island「學習人物誌」分頁共用。
 */
export function PersonaProfileMe() {
  const router = useRouter();
  const t = useMobileTranslation("persona");
  const tCommon = useMobileTranslation("common");
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    mutate: mutateProfile,
  } = usePersonaProfileMe(undefined, {
    enabled: isAuthenticated,
  });
  const {
    data: questionsData,
    isLoading: isQuestionsLoading,
    error: questionsError,
    mutate: mutateQuestions,
  } = usePersonaQuestions(undefined, {
    enabled: !isAuthenticated,
  });

  const isLoading = isAuthLoading || (isAuthenticated ? isProfileLoading : isQuestionsLoading);
  const error = isAuthenticated ? profileError : questionsError;
  const retry = isAuthenticated ? mutateProfile : mutateQuestions;

  const questions: PersonaQuestionSummary[] = isAuthenticated
    ? (profileData?.data?.questions ?? []).map((q) => ({
        id: q.id,
        prompt: q.prompt,
        answer: q.isPlaceholder ? null : q.answer,
      }))
    : (questionsData?.data?.questions ?? []).map((q) => ({
        id: q.id,
        prompt: q.prompt,
        answer: null,
      }));

  if (isLoading) {
    return (
      <YStack alignItems="center" justifyContent="center" paddingVertical="$8" minHeight={160}>
        <Spinner size="large" color={colors.primary.base} />
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack alignItems="center" justifyContent="center" gap="$3" paddingVertical="$8">
        <Text fontSize={14} color={colors.text.muted} textAlign="center">
          {t("myProfile.error")}
        </Text>
        <Button backgroundColor={colors.primary.base} onPress={() => retry()}>
          <Text color="white" fontWeight="600">
            {tCommon("refresh")}
          </Text>
        </Button>
      </YStack>
    );
  }

  if (questions.length === 0) {
    return (
      <YStack alignItems="center" justifyContent="center" paddingVertical="$8" minHeight={120}>
        <Text color={colors.text.muted}>{t("myProfile.empty")}</Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <YStack paddingBottom="$2">
        <Text fontSize={16} fontWeight="700" color="$color" textAlign="center">
          {t("tab.headerTitle")}
        </Text>
        <Text fontSize={13} color={colors.text.muted} textAlign="center" marginTop="$1">
          {t("tab.headerSubtitle")}
        </Text>
      </YStack>

      {questions.map((q) => (
        <PersonaQuestionCard
          key={q.id}
          question={q}
          onPress={() => router.push(`/persona/${q.id}`)}
        />
      ))}
    </YStack>
  );
}

function PersonaQuestionCard({
  question,
  onPress,
}: {
  question: PersonaQuestionSummary;
  onPress: () => void;
}) {
  const t = useMobileTranslation("persona.myProfile");
  const isAnswered = question.answer !== null;
  const answerText = question.answer?.selectedValue ?? question.answer?.textAnswer ?? "";

  return (
    <Card
      borderWidth={1}
      borderColor={colors.gray.light}
      borderRadius="$md"
      padding="$3"
      backgroundColor="$background"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
    >
      <Text fontSize={14} fontWeight="600" color="$color">
        {question.prompt}
      </Text>
      <XStack alignItems="center" gap="$2" marginTop="$1.5">
        {isAnswered ? (
          <Text fontSize={12} color={colors.primary.base} fontWeight="500">
            {t("answeredLabel")}
          </Text>
        ) : (
          <Text fontSize={12} color={colors.text.muted}>
            {t("unansweredLabel")}
          </Text>
        )}
        {isAnswered && (question.answer?.resonanceCount ?? 0) > 0 && (
          <Text fontSize={12} color={colors.text.muted}>
            · ✦ {question.answer?.resonanceCount}
          </Text>
        )}
      </XStack>

      {isAnswered ? (
        <YStack
          marginTop="$2"
          padding="$2"
          borderRadius="$sm"
          backgroundColor={`${colors.primary.base}14`}
        >
          <Text fontSize={12} color={colors.primary.base} fontWeight="500" marginBottom="$1">
            {t("myAnswerLabel")}
          </Text>
          <Text fontSize={13} color="$color" opacity={0.75} numberOfLines={2}>
            {answerText}
          </Text>
        </YStack>
      ) : (
        <XStack
          marginTop="$2"
          padding="$3"
          borderRadius="$sm"
          backgroundColor={colors.background.veryLightGray}
          alignItems="center"
          justifyContent="center"
          gap="$2"
        >
          <Lock size={14} color={colors.text.muted} />
          <Text fontSize={12} color={colors.text.muted}>
            {t("unansweredHint")}
          </Text>
        </XStack>
      )}
    </Card>
  );
}
