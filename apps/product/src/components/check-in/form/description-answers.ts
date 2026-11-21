export interface CheckInDescriptionAnswers {
  actionObservation: string;
  nextStep: string;
}

export const CHECK_IN_ACTION_OBSERVATION_WORD_LIMIT = 300;
export const CHECK_IN_ACTION_OBSERVATION_CHARACTER_LIMIT = 600;
export const CHECK_IN_NEXT_STEP_WORD_LIMIT = 300;

const ACTION_HEADINGS = new Set([
  "紀錄你的行動",
  "Write down what you tried",
  "你試了什麼？",
  "What did you try?",
]);

const NEXT_STEP_HEADINGS = new Set([
  "下次可以做什麼調整或嘗試？",
  "你可以調整什麼，或接著試試什麼？",
  "What might you adjust or try next time?",
  "What might you adjust or try next?",
]);

export const isCheckInNextStepHeading = (line: string) =>
  NEXT_STEP_HEADINGS.has(line.trim());

export const countCheckInWords = (text: string, locale: string) => {
  const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
  return Array.from(segmenter.segment(text)).filter((segment) => segment.isWordLike).length;
};

export const parseCheckInDescription = (description: string): CheckInDescriptionAnswers => {
  const answerLines: Record<keyof CheckInDescriptionAnswers, string[]> = {
    actionObservation: [],
    nextStep: [],
  };
  let section: keyof CheckInDescriptionAnswers = "actionObservation";
  let hasSections = false;

  for (const line of description.split(/\r?\n/)) {
    const heading = line.trim();
    if (ACTION_HEADINGS.has(heading)) {
      section = "actionObservation";
      hasSections = true;
      continue;
    }
    if (NEXT_STEP_HEADINGS.has(heading)) {
      section = "nextStep";
      hasSections = true;
      continue;
    }
    answerLines[section].push(line);
  }

  if (!hasSections) return { actionObservation: description, nextStep: "" };

  return {
    actionObservation: answerLines.actionObservation.join("\n").trim(),
    nextStep: answerLines.nextStep.join("\n").trim(),
  };
};

export const formatCheckInDescription = (
  answers: CheckInDescriptionAnswers,
  headings: { nextStep: string }
) => {
  const sections = [answers.actionObservation.trim()];
  if (answers.nextStep.trim()) {
    sections.push(`${headings.nextStep}\n${answers.nextStep.trim()}`);
  }
  return sections.join("\n\n");
};
