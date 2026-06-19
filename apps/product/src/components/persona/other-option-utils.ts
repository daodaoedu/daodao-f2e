export const OTHER_OPTION_VALUE = "其他";

export function isOtherOption(value: string): boolean {
  return value === OTHER_OPTION_VALUE;
}

type PersonaAnswerBody =
  | { questionId: number; selectedValue?: string; textAnswer?: undefined }
  | { questionId: number; textAnswer?: string; selectedValue?: undefined };

/**
 * Builds the request body for submitPersonaAnswer based on the question type
 * and whether the user selected the "other" option.
 */
export function buildPersonaAnswerBody(
  questionId: number,
  isChoice: boolean,
  selectedValue: string,
  textAnswer: string,
  otherText: string
): PersonaAnswerBody {
  if (!isChoice) {
    return { questionId, textAnswer: textAnswer.trim() || undefined };
  }
  if (isOtherOption(selectedValue)) {
    return { questionId, textAnswer: otherText.trim() || undefined };
  }
  return { questionId, selectedValue: selectedValue || undefined };
}
