import { extractApiErrorMessage, submitPersonaAnswer } from "@daodao/api";
import { useState } from "react";
import { Alert } from "react-native";
import { TextArea, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { useMobileTranslation } from "@/i18n";

interface PersonaAnswerFormProps {
  questionId: number;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  onSuccess: () => void;
}

export function PersonaAnswerForm({
  questionId,
  questionType,
  options,
  onSuccess,
}: PersonaAnswerFormProps) {
  const t = useMobileTranslation("persona.myProfile");
  const [selected, setSelected] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isChoice = questionType === "choice" && options != null && options.length > 0;

  const handleSubmit = async () => {
    if (isChoice && !selected) return;
    if (!isChoice && !textAnswer.trim()) return;
    setSubmitting(true);
    try {
      // openapi 此 path 未宣告 error response，TS 會把 error 收成 never — 執行時仍可能有 error
      const res = (await submitPersonaAnswer(
        isChoice
          ? { questionId, selectedValue: selected }
          : { questionId, textAnswer: textAnswer.trim() }
      )) as { error?: unknown };
      if (res.error) {
        Alert.alert(extractApiErrorMessage(res.error, t("submitError")));
        return;
      }
      onSuccess();
    } catch (error) {
      Alert.alert(extractApiErrorMessage(error, t("submitError")));
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
      <TextArea
        value={textAnswer}
        onChangeText={setTextAnswer}
        placeholder={t("textPlaceholder")}
        maxLength={300}
        minHeight={72}
        borderColor="$borderColor"
        backgroundColor="$background"
        color="$color"
      />
      <Button size="$3" onPress={handleSubmit} disabled={submitting || !textAnswer.trim()}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </YStack>
  );
}
