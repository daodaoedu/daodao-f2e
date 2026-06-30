import {
  dismissPersonaCarousel,
  submitPersonaAnswer,
  useMutate,
  usePersonaCarouselState,
} from "@daodao/api";
import { useState } from "react";
import { Alert, ScrollView, TextInput } from "react-native";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import { useMobileTranslation } from "@/i18n";

interface QuestionCardProps {
  questionId: number;
  prompt: string;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  onAnswered: () => void;
  onSwitch: (questionId: number) => void;
}

function QuestionCard({
  questionId,
  prompt,
  questionType,
  options,
  onAnswered,
  onSwitch,
}: QuestionCardProps) {
  const t = useMobileTranslation("persona.myProfile");
  const carouselT = useMobileTranslation("persona.carousel");
  const [selected, setSelected] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isChoice = questionType === "choice" && options && options.length > 0;

  const handleSubmit = async () => {
    if (isChoice && !selected) return;
    if (!isChoice && !textAnswer.trim()) return;
    setSubmitting(true);
    try {
      const res = await submitPersonaAnswer(
        isChoice
          ? { questionId, selectedValue: selected }
          : { questionId, textAnswer: textAnswer.trim() }
      );
      if (res.error) {
        Alert.alert(t("submitError"));
        return;
      }
      onAnswered();
    } catch {
      Alert.alert(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card bordered p="$3" mr="$2" width={280} bg="$background">
      <Text fontSize="$3" fontWeight="600" mb="$2">
        {prompt}
      </Text>

      {isChoice ? (
        <XStack flexWrap="wrap" gap="$2" mb="$3">
          {options.map((opt) => (
            <Button
              key={opt}
              size="$2"
              variant={selected === opt ? undefined : "outlined"}
              onPress={() => setSelected(opt)}
            >
              {opt}
            </Button>
          ))}
        </XStack>
      ) : (
        <TextInput
          value={textAnswer}
          onChangeText={setTextAnswer}
          placeholder={t("textPlaceholder")}
          multiline
          numberOfLines={3}
          maxLength={300}
          style={{
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            padding: 8,
            fontSize: 14,
            marginBottom: 12,
          }}
        />
      )}

      <XStack jc="space-between" ai="center">
        <Button size="$2" variant="outlined" onPress={() => onSwitch(questionId)}>
          {carouselT("switchQuestion")}
        </Button>
        <Button
          size="$2"
          onPress={handleSubmit}
          disabled={submitting || (isChoice ? !selected : !textAnswer.trim())}
        >
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </XStack>
    </Card>
  );
}

export function ResonanceCarousel() {
  const carouselT = useMobileTranslation("persona.carousel");
  const mutate = useMutate();
  const [replaceId, setReplaceId] = useState<number | undefined>(undefined);
  const [dismissing, setDismissing] = useState(false);

  const { data, isLoading } = usePersonaCarouselState(replaceId);

  const shouldShow = data?.data?.shouldShow;
  const questions = data?.data?.questions ?? [];

  if (isLoading || !shouldShow || questions.length === 0) return null;

  const handleDismiss = async () => {
    setDismissing(true);
    try {
      await dismissPersonaCarousel();
      await mutate(["/api/v1/persona/carousel-state"] as const);
    } catch {
      Alert.alert(carouselT("error"));
    } finally {
      setDismissing(false);
    }
  };

  const handleAnswered = async () => {
    await mutate(["/api/v1/persona/carousel-state"] as const);
  };

  return (
    <YStack mb="$3">
      <XStack jc="space-between" ai="center" mb="$2" px="$1">
        <Text fontSize="$4" fontWeight="600">
          {carouselT("title")}
        </Text>
        <Button size="$2" variant="outlined" onPress={handleDismiss} disabled={dismissing}>
          {carouselT("dismiss")}
        </Button>
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            questionId={q.id}
            prompt={q.prompt}
            questionType={q.questionType}
            options={q.options}
            onAnswered={handleAnswered}
            onSwitch={(id) => setReplaceId(id)}
          />
        ))}
      </ScrollView>
    </YStack>
  );
}
