import { describe, expect, it } from "vitest";
import type { SurveyQuestion } from "../../types";
import { managedAnswerError, toggleRankedOption } from "../managed-answer";

const question: SurveyQuestion = {
  id: "1",
  surveyId: "2",
  questionText: "選擇",
  questionType: "text",
  inputType: "text",
  isRequired: true,
  options: [
    { id: 10, label: "甲", order: 0 },
    { id: 11, label: "乙", order: 1 },
  ],
  conditions: [],
  aiMetadata: {},
  order: 0,
  createdAt: "",
  updatedAt: "",
};

describe("managed survey answers", () => {
  it("requires nonblank text and nonempty selections while allowing a false yes/no answer", () => {
    expect(managedAnswerError(question, "  ")).toBeTruthy();
    expect(managedAnswerError({ ...question, questionType: "multiple_choice" }, [])).toBeTruthy();
    expect(managedAnswerError({ ...question, questionType: "yesno" }, false)).toBeNull();
    expect(managedAnswerError({ ...question, isRequired: false }, " ")).toBeNull();
  });
  it("validates Email and http(s) links, preserving legitimate uppercase and Chinese input", () => {
    expect(managedAnswerError({ ...question, inputType: "email" }, "XIAO@example.com")).toBeNull();
    expect(managedAnswerError({ ...question, inputType: "email" }, "not-an-email")).toBeTruthy();
    for (const value of ["javascript:alert(1)", "ftp://example.com", "broken"]) {
      expect(managedAnswerError({ ...question, inputType: "url" }, value)).toBeTruthy();
    }
    expect(
      managedAnswerError({ ...question, inputType: "url" }, "https://example.com/中文")
    ).toBeNull();
  });
  it("accepts scale endpoints including zero, rejecting fractional and out-of-range values", () => {
    const scale = { ...question, questionType: "scale" as const, scaleMin: -2, scaleMax: 2 };
    for (const value of [-2, 0, 2]) expect(managedAnswerError(scale, value)).toBeNull();
    for (const value of [-3, 3, 1.5]) expect(managedAnswerError(scale, value)).toBeTruthy();
    expect(managedAnswerError({ ...question, questionType: "rating" }, 0)).toBeTruthy();
    expect(managedAnswerError({ ...question, questionType: "rating" }, 5)).toBeNull();
  });
  it("rejects foreign and duplicate options and multiple single-choice answers", () => {
    const ranking = { ...question, questionType: "ranking" as const };
    expect(managedAnswerError(ranking, [11, 10])).toBeNull();
    expect(managedAnswerError(ranking, [10, 10])).toBeTruthy();
    expect(managedAnswerError(ranking, [99])).toBeTruthy();
    expect(
      managedAnswerError({ ...question, questionType: "single_choice" }, [10, 11])
    ).toBeTruthy();
  });
  it("cancels a rank, closes the gap and appends it when selected again without mutating state", () => {
    const initial = [10, 11, 12];
    const removed = toggleRankedOption(initial, 11);
    expect(removed).toEqual([10, 12]);
    expect(toggleRankedOption(removed, 11)).toEqual([10, 12, 11]);
    expect(initial).toEqual([10, 11, 12]);
  });
});
