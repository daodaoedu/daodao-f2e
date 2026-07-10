import { type PersonaQuestionAnswerItem, usePersonaQuestionAnswers } from "@daodao/api";
import { ChevronLeft, Lock, MessageSquareQuote } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { PersonaAnswerForm } from "@/components/persona/PersonaAnswerForm";
import { PersonaResponseItem } from "@/components/persona/PersonaResponseItem";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

const PAGE_SIZE = 20;

export default function PersonaDetailScreen() {
  const router = useRouter();
  const t = useMobileTranslation("persona.detail");
  const tUserProfile = useMobileTranslation("persona.userProfile");
  const tCommon = useMobileTranslation("common");
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(id) ? id[0] : id;
  const questionId = Number(rawId);
  const isValidId = Number.isInteger(questionId);

  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [answers, setAnswers] = useState<PersonaQuestionAnswerItem[]>([]);
  const [pendingReset, setPendingReset] = useState(false);
  const lastDataRef = useRef<unknown>(undefined);

  const { data, error, isLoading, isValidating, mutate } = usePersonaQuestionAnswers(questionId, {
    limit: PAGE_SIZE,
    cursor,
    enabled: isValidId,
  });

  // Reset local pagination state when navigating between different questions,
  // otherwise the new screen could briefly show (or merge in) the previous
  // question's answers.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset state when questionId changes
  useEffect(() => {
    setCursor(undefined);
    setAnswers([]);
    setPendingReset(false);
    lastDataRef.current = undefined;
  }, [questionId]);

  useEffect(() => {
    if (!data?.data || data === lastDataRef.current) return;
    lastDataRef.current = data;
    setAnswers((prev) => {
      const newAnswers = data.data.answers ?? [];
      if (cursor === undefined) return newAnswers;
      if (newAnswers.length === 0) return prev;
      // De-dupe by answerId so a revalidation of the current page never
      // re-appends items that are already in the accumulated list.
      const merged = new Map(prev.map((item) => [item.answerId, item]));
      for (const item of newAnswers) {
        merged.set(item.answerId, item);
      }
      return Array.from(merged.values());
    });
  }, [data, cursor]);

  // Once cursor resets back to the first page, force a fresh revalidation
  // (bypassing any stale cache) so a newly-submitted answer shows up.
  useEffect(() => {
    if (pendingReset && cursor === undefined) {
      setPendingReset(false);
      mutate();
    }
  }, [pendingReset, cursor, mutate]);

  const question = data?.data?.question;
  const hasMore = data?.data?.hasMore ?? false;
  const nextCursor = data?.data?.nextCursor ?? undefined;
  const viewerIsLocked = data?.data?.viewerIsLocked ?? false;
  const answersNeeded = data?.data?.answersNeeded ?? 0;
  const hasSelfAnswered = answers.some((a) => a.isSelf);

  const handleLoadMore = () => {
    if (nextCursor != null) setCursor(nextCursor);
  };

  const handleAnswerSuccess = async () => {
    if (cursor === undefined) {
      await mutate();
      return;
    }
    // Jump back to the first page so the new answer (and the rest of the
    // community list) reloads from scratch instead of appending onto
    // whatever page the user happened to be viewing.
    setAnswers([]);
    setPendingReset(true);
    setCursor(undefined);
  };

  const renderHeader = () => (
    <XStack padding="$4" alignItems="center" gap="$3">
      <Button
        size="$4"
        circular
        chromeless
        onPress={() => router.back()}
        accessibilityLabel={tCommon("back")}
      >
        <ChevronLeft size={24} color="$color" />
      </Button>
      <Text fontSize={18} fontWeight="600" color="$color" numberOfLines={1} flex={1}>
        {question?.prompt ?? ""}
      </Text>
    </XStack>
  );

  if (!isValidId || error) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background">
          {renderHeader()}
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$3" padding="$6">
            <Text fontSize={16} fontWeight="600" color="$color">
              {isValidId ? t("loadError") : t("questionNotFound")}
            </Text>
            <Button backgroundColor={colors.primary.base} onPress={() => mutate()}>
              <Text color="white" fontWeight="600">
                {tCommon("refresh")}
              </Text>
            </Button>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  if (isLoading && !question) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background">
          {renderHeader()}
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Spinner size="large" color={colors.primary.base} />
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        {renderHeader()}
        <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
          <Card
            borderWidth={1}
            borderColor={colors.gray.light}
            borderRadius="$md"
            padding="$4"
            gap="$2"
            alignItems="center"
          >
            <MessageSquareQuote size={28} color={colors.primary.base} />
            <Text fontSize={17} fontWeight="700" color="$color" textAlign="center">
              {question?.prompt}
            </Text>
            {(question?.totalAnswerCount ?? 0) > 0 && (
              <Text fontSize={12} color={colors.text.muted}>
                {t("answeredCount", { count: question?.totalAnswerCount ?? 0 })}
              </Text>
            )}
          </Card>

          {!hasSelfAnswered && question && (
            <Card borderWidth={1} borderColor={colors.gray.light} borderRadius="$md" padding="$4">
              <Text fontSize={14} color="$color" opacity={0.7} marginBottom="$1">
                {t("shareThoughts")}
              </Text>
              <PersonaAnswerForm
                questionId={question.id}
                questionType={question.questionType}
                options={question.options}
                onSuccess={handleAnswerSuccess}
              />
            </Card>
          )}

          <YStack gap="$2">
            <Text fontSize={15} fontWeight="700" color="$color">
              {t("responsesTitle")}
            </Text>

            {viewerIsLocked ? (
              <Card
                borderWidth={1}
                borderStyle="dashed"
                borderColor={colors.gray.light}
                borderRadius="$md"
                padding="$4"
                alignItems="center"
                gap="$2"
              >
                <Lock size={22} color={colors.text.muted} />
                <Text fontSize={13} color={colors.text.muted} textAlign="center">
                  {t("lockedResponses")}
                </Text>
                {answersNeeded > 0 && (
                  <Text fontSize={12} color={colors.text.muted} textAlign="center">
                    {tUserProfile("lockedMessage", { count: answersNeeded })}
                  </Text>
                )}
              </Card>
            ) : answers.length === 0 ? (
              <Text fontSize={13} color={colors.text.muted} textAlign="center" paddingVertical="$4">
                {t("emptyResponses")}
              </Text>
            ) : (
              <YStack gap="$3">
                {answers.map((item) => (
                  <PersonaResponseItem key={item.answerId} item={item} />
                ))}

                {hasMore ? (
                  <Button variant="outlined" onPress={handleLoadMore} disabled={isValidating}>
                    {isValidating ? <Spinner size="small" /> : <Text>{tCommon("load_more")}</Text>}
                  </Button>
                ) : (
                  <Text fontSize={12} color={colors.text.muted} textAlign="center">
                    {t("allResponsesShown", { count: answers.length })}
                  </Text>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
