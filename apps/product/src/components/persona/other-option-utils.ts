type PersonaAnswerBody =
  | { questionId: number; selectedValue?: string; textAnswer?: undefined }
  | { questionId: number; textAnswer?: string; selectedValue?: undefined };

export function buildPersonaAnswerBody(
  questionId: number,
  isChoice: boolean,
  selectedValue: string,
  textAnswer: string,
  isCustomAnswer: boolean,
  customText: string
): PersonaAnswerBody {
  if (!isChoice) {
    return { questionId, textAnswer: textAnswer.trim() || undefined };
  }
  if (isCustomAnswer) {
    return { questionId, textAnswer: customText.trim() || undefined };
  }
  return { questionId, selectedValue: selectedValue || undefined };
}
