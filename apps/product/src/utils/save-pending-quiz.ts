/**
 * Builds an API payload from raw quiz sessionStorage data.
 * Self-contained — no imports from @daodao/features-quiz to avoid
 * static asset imports that break the node test environment.
 * All quiz answer values are 1, so the score algorithm is equivalent
 * to calculateQuizAnalysis from the quiz package.
 */

type AnswerKey = "L" | "C" | "A" | "D" | "O";
type ScoreRecord = Record<AnswerKey, number>;
type ParsedAnswers = Record<string, { selectedAnswer: AnswerKey }>;

const VALID_KEYS = new Set<AnswerKey>(["L", "C", "A", "D", "O"]);
const QUESTION_COUNT = 10;

function isAnswerKey(v: unknown): v is AnswerKey {
  return VALID_KEYS.has(v as AnswerKey);
}

function parseAnswers(raw: unknown): ParsedAnswers | null {
  if (typeof raw !== "object" || raw === null) return null;
  const out: ParsedAnswers = {};
  for (const [k, v] of Object.entries(raw)) {
    if (
      /^q\d+$/.test(k) &&
      typeof v === "object" &&
      v !== null &&
      isAnswerKey((v as { selectedAnswer?: unknown }).selectedAnswer)
    ) {
      out[k] = { selectedAnswer: (v as { selectedAnswer: AnswerKey }).selectedAnswer };
    }
  }
  return out;
}

function computeScores(answers: ParsedAnswers): ScoreRecord {
  const scores: ScoreRecord = { A: 1, O: 1, L: 1, C: 1, D: 1 };
  for (const { selectedAnswer } of Object.values(answers)) {
    scores[selectedAnswer] += 1;
  }
  return scores;
}

function applyTieBreaking(scores: ScoreRecord, answers: ParsedAnswers): void {
  const maxVal = Math.max(...Object.values(scores));
  const tied = (Object.keys(scores) as AnswerKey[]).filter((k) => scores[k] === maxVal);
  if (tied.length <= 1) return;
  const reversed = Object.values(answers).reverse();
  const last = reversed.find(({ selectedAnswer }) => tied.includes(selectedAnswer));
  if (last) scores[last.selectedAnswer] += 1;
}

function getResultType(scores: ScoreRecord): AnswerKey {
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return (top?.[0] ?? "A") as AnswerKey;
}

export interface QuizSavePayload {
  resultType: string;
  scores: Record<string, number>;
  answers: Record<string, { selectedAnswer: string }>;
}

export function buildQuizSaveRequest(rawData: unknown): QuizSavePayload | null {
  const parsed = parseAnswers(rawData);
  if (!parsed || Object.keys(parsed).length < QUESTION_COUNT) return null;

  const scores = computeScores(parsed);
  applyTieBreaking(scores, parsed);
  const resultType = getResultType(scores);

  const formattedAnswers: Record<string, { selectedAnswer: string }> = {};
  for (const [qId, answer] of Object.entries(parsed)) {
    formattedAnswers[qId.replace("q", "")] = { selectedAnswer: answer.selectedAnswer };
  }

  return { resultType, scores, answers: formattedAnswers };
}
