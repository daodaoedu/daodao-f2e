import { describe, expect, it } from "vitest";
import type { IQuestion } from "../../types";
import { isAnswerValue, isQuestionId, parseQuizResult } from "../validation";

// Minimal mock question map for testing
const mockQuestionMap = new Map<string, IQuestion>([
  ["q1", { id: "q1", title: "Question 1" } as IQuestion],
  ["q2", { id: "q2", title: "Question 2" } as IQuestion],
]);

describe("isAnswerValue", () => {
  it.each(["L", "C", "A", "D", "O"])("returns true for valid answer key '%s'", (key) => {
    expect(isAnswerValue(key)).toBe(true);
  });

  it.each([
    "X",
    "Z",
    "",
    "l",
    "a",
    1,
    null,
    undefined,
    {},
    [],
  ])("returns false for invalid value %s", (value) => {
    expect(isAnswerValue(value)).toBe(false);
  });
});

describe("isQuestionId", () => {
  it("returns true for a valid question id", () => {
    expect(isQuestionId("q1", mockQuestionMap)).toBe(true);
    expect(isQuestionId("q2", mockQuestionMap)).toBe(true);
  });

  it("returns false for an unknown question id", () => {
    expect(isQuestionId("q99", mockQuestionMap)).toBe(false);
  });

  it("returns false for non-string values", () => {
    expect(isQuestionId(42, mockQuestionMap)).toBe(false);
    expect(isQuestionId(null, mockQuestionMap)).toBe(false);
  });
});

describe("parseQuizResult", () => {
  it("returns null for non-object values", () => {
    expect(parseQuizResult(null, mockQuestionMap)).toBe(null);
    expect(parseQuizResult(undefined, mockQuestionMap)).toBe(null);
    expect(parseQuizResult("string", mockQuestionMap)).toBe(null);
    expect(parseQuizResult(42, mockQuestionMap)).toBe(null);
  });

  it("parses a valid quiz result", () => {
    const input = {
      q1: { selectedAnswer: "L" },
      q2: { selectedAnswer: "A" },
    };
    const result = parseQuizResult(input, mockQuestionMap);
    expect(result).toEqual({
      q1: { selectedAnswer: "L" },
      q2: { selectedAnswer: "A" },
    });
  });

  it("filters out entries with invalid question ids", () => {
    const input = {
      q1: { selectedAnswer: "L" },
      q99: { selectedAnswer: "A" },
    };
    const result = parseQuizResult(input, mockQuestionMap);
    expect(result).toEqual({
      q1: { selectedAnswer: "L" },
    });
  });

  it("filters out entries with invalid answer values", () => {
    const input = {
      q1: { selectedAnswer: "L" },
      q2: { selectedAnswer: "INVALID" },
    };
    const result = parseQuizResult(input, mockQuestionMap);
    expect(result).toEqual({
      q1: { selectedAnswer: "L" },
    });
  });

  it("returns empty object for an empty input object", () => {
    const result = parseQuizResult({}, mockQuestionMap);
    expect(result).toEqual({});
  });

  it("filters out entries with missing selectedAnswer", () => {
    const input = {
      q1: {},
      q2: { selectedAnswer: "D" },
    };
    const result = parseQuizResult(input, mockQuestionMap);
    expect(result).toEqual({
      q2: { selectedAnswer: "D" },
    });
  });
});
