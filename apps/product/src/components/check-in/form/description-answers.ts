export interface CheckInDescriptionAnswers {
  actionObservation: string;
  nextStep: string;
}

export const CHECK_IN_ACTION_OBSERVATION_WORD_LIMIT = 300;
export const CHECK_IN_ACTION_OBSERVATION_CHARACTER_LIMIT = 600;
export const CHECK_IN_NEXT_STEP_WORD_LIMIT = 300;

const NEXT_STEP_HEADINGS = new Set([
  "下次可以做什麼調整或嘗試？",
  "你可以調整什麼，或接著試試什麼？",
  "What might you adjust or try next time?",
  "What might you adjust or try next?",
]);

export const isCheckInNextStepHeading = (line: string) => NEXT_STEP_HEADINGS.has(line.trim());

export const countCheckInWords = (text: string, locale: string) => {
  const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
  return Array.from(segmenter.segment(text)).filter((segment) => segment.isWordLike).length;
};

/** Stored notes are free text: headings cannot reliably identify a structured record. */
export const parseCheckInDescription = (description: string): CheckInDescriptionAnswers => ({
  actionObservation: description,
  nextStep: "",
});

export const formatCheckInDescription = (
  answers: CheckInDescriptionAnswers,
  headings: { nextStep: string }
) => {
  const sections = answers.actionObservation ? [answers.actionObservation] : [];
  if (answers.nextStep.trim()) {
    sections.push(`${headings.nextStep}\n${answers.nextStep.trim()}`);
  }
  return sections.join("\n\n");
};
