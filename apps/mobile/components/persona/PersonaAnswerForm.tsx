import { submitPersonaAnswer } from "@daodao/api";
import { useState } from "react";
import { Alert, TextInput } from "react-native";
import { Button, XStack, YStack } from "tamagui";
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
      const res = await submitPersonaAnswer(
        isChoice
          ? { questionId, selectedValue: selected }
          : { questionId, textAnswer: textAnswer.trim() }
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
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          padding: 8,
          fontSize: 14,
        }}
      />
      <Button size="$3" onPress={handleSubmit} disabled={submitting || !textAnswer.trim()}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </YStack>
  );
}
