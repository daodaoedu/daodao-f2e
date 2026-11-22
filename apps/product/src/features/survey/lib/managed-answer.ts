import { z } from "zod";
import type { Answer, SurveyQuestion } from "../types";

/** Toggle a ranked option while keeping the remaining ranks contiguous. */
export function toggleRankedOption(current: number[], optionId: number): number[] {
  return current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : [...current, optionId];
}

/** Validate an answer against the published question rather than truthiness. */
export function managedAnswerError(
  question: SurveyQuestion,
  value: Answer["value"] | undefined
): string | null {
  const empty =
    value == null ||
    (typeof value === "string" && !value.trim()) ||
    (Array.isArray(value) && value.length === 0);
  if (empty) return question.isRequired ? "請完成此必填題目" : null;
  if (question.questionType === "text") {
    if (typeof value !== "string") return "請輸入文字";
    if (value.length > 10000) return "回答最多 10,000 字";
    if (question.inputType === "email" && !z.string().email().safeParse(value.trim()).success) {
      return "請輸入有效的 Email";
    }
    if (question.inputType === "url") {
      try {
        const url = new URL(value.trim());
        if (!["https:", "http:"].includes(url.protocol) || !url.hostname)
          return "請輸入有效的 http 或 https 連結";
      } catch {
        return "請輸入有效的 http 或 https 連結";
      }
    }
    return null;
  }
  if (question.questionType === "yesno") return typeof value === "boolean" ? null : "請選擇是或否";
  if (question.questionType === "rating" || question.questionType === "scale") {
    const min = question.questionType === "rating" ? 1 : (question.scaleMin ?? 0);
    const max = question.questionType === "rating" ? 5 : (question.scaleMax ?? 10);
    return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
      ? null
      : `請選擇 ${min} 到 ${max} 之間的數值`;
  }
  const ids = new Set(question.options.map((option) => option.id ?? option.order));
  if (
    !Array.isArray(value) ||
    !value.every((id) => typeof id === "number" && ids.has(id)) ||
    new Set<string | number>(value).size !== value.length
  )
    return "請選擇有效且不重複的選項";
  if (question.questionType === "single_choice" && value.length !== 1) return "請選擇一個選項";
  return null;
}
