import { submitPersonaAnswer, usePersonaProfileMe, useMutate } from "@daodao/api";
import { useState } from "react";
import { Alert, ScrollView as RNScrollView, TextInput } from "react-native";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import { useMobileTranslation } from "@/i18n";

interface InlineAnswerFormProps {
  questionId: number;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  onSuccess: () => void;
}

function InlineAnswerForm({ questionId, questionType, options, onSuccess }: InlineAnswerFormProps) {
  const t = useMobileTranslation("persona.myProfile");
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
        isChoice ? { questionId, selectedValue: selected } : { questionId, textAnswer: textAnswer.trim() }
      );
      if (res.error) {
        Alert.alert(t("submitError"));
        return;
      }
      onSuccess();
    } catch {
      Alert.alert(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (isChoice) {
    return (
      <YStack gap="$2" mt="$2">
        <XStack flexWrap="wrap" gap="$2">
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
        <Button size="$3" onPress={handleSubmit} disabled={submitting || !selected}>
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </YStack>
    );
  }

  return (
    <YStack mt="$2" gap="$2">
      <TextInput
        value={textAnswer}
        onChangeText={setTextAnswer}
        placeholder={t("textPlaceholder")}
        multiline
        numberOfLines={3}
        maxLength={300}
        style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 8, fontSize: 14 }}
      />
      <Button size="$3" onPress={handleSubmit} disabled={submitting || !textAnswer.trim()}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </YStack>
  );
}

export function PersonaProfileTab() {
  const t = useMobileTranslation("persona.myProfile");
  const { data, isLoading } = usePersonaProfileMe();
  const mutate = useMutate();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleAnswerSuccess = async () => {
    await mutate(["/api/v1/persona/profile/me"] as const);
    setExpandedId(null);
  };

  if (isLoading) {
    return (
      <YStack flex={1} ai="center" jc="center" p="$4">
        <Text color="$gray8">{t("loading")}</Text>
      </YStack>
    );
  }

  const questions = data?.data?.questions ?? [];

  return (
    <RNScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {questions.map((q) => {
        const isExpanded = expandedId === q.id;

        if (q.isPlaceholder) {
          return (
            <Card
              key={q.id}
              bordered
              borderStyle="dashed"
              p="$3"
              onPress={() => setExpandedId(isExpanded ? null : q.id)}
            >
              <Text fontSize="$3" color="$gray10">{q.prompt}</Text>
              {isExpanded ? (
                <InlineAnswerForm
                  questionId={q.id}
                  questionType={q.questionType}
                  options={q.options}
                  onSuccess={() => handleAnswerSuccess()}
                />
              ) : (
                <Text fontSize="$2" color="$blue9" mt="$1">{t("clickToAnswer")}</Text>
              )}
            </Card>
          );
        }

        return (
          <Card key={q.id} bordered p="$3" bg="$background">
            <Text fontSize="$2" color="$gray9" mb="$1">{q.prompt}</Text>
            <Text fontSize="$4" fontWeight="600">
              {q.answer?.selectedValue ?? q.answer?.textAnswer ?? ""}
            </Text>
            {(q.answer?.resonanceCount ?? 0) > 0 && (
              <Text fontSize="$2" color="$gray8" mt="$1">
                ✦ {q.answer?.resonanceCount} {t("resonances")}
              </Text>
            )}
          </Card>
        );
      })}
    </RNScrollView>
  );
}
