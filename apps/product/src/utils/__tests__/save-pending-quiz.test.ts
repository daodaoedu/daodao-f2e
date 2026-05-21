import { describe, expect, it } from "vitest";
import { buildQuizSaveRequest } from "../save-pending-quiz";

const ALL_ANSWERS: Record<string, { selectedAnswer: string }> = {
  q1: { selectedAnswer: "L" },
  q2: { selectedAnswer: "C" },
  q3: { selectedAnswer: "A" },
  q4: { selectedAnswer: "D" },
  q5: { selectedAnswer: "O" },
  q6: { selectedAnswer: "L" },
  q7: { selectedAnswer: "C" },
  q8: { selectedAnswer: "A" },
  q9: { selectedAnswer: "D" },
  q10: { selectedAnswer: "L" },
};

describe("buildQuizSaveRequest", () => {
  it("returns null for null input", () => {
    expect(buildQuizSaveRequest(null)).toBeNull();
  });

  it("returns null for non-object input", () => {
    expect(buildQuizSaveRequest("string")).toBeNull();
    expect(buildQuizSaveRequest(42)).toBeNull();
    expect(buildQuizSaveRequest(undefined)).toBeNull();
  });

  it("returns null when quiz is incomplete (fewer than 10 answers)", () => {
    const partial = { q1: { selectedAnswer: "L" }, q2: { selectedAnswer: "C" } };
    expect(buildQuizSaveRequest(partial)).toBeNull();
  });

  it("returns null when answers contain invalid answer keys", () => {
    const bad = { ...ALL_ANSWERS, q1: { selectedAnswer: "X" } };
    expect(buildQuizSaveRequest(bad)).toBeNull();
  });

  it("returns a valid request for a complete quiz", () => {
    const req = buildQuizSaveRequest(ALL_ANSWERS);
    expect(req).not.toBeNull();
    expect(["L", "C", "A", "D", "O"]).toContain(req?.resultType);
    expect(req?.scores).toHaveProperty("L");
    expect(req?.scores).toHaveProperty("C");
    expect(req?.scores).toHaveProperty("A");
    expect(req?.scores).toHaveProperty("D");
    expect(req?.scores).toHaveProperty("O");
  });

  it("formats answers with numeric question numbers (q1 → 1)", () => {
    const req = buildQuizSaveRequest(ALL_ANSWERS);
    expect(req?.answers).toHaveProperty("1");
    expect(req?.answers).toHaveProperty("10");
    expect(req?.answers?.["1"]).toEqual({ selectedAnswer: "L" });
  });

  it("picks resultType as the most-selected answer key", () => {
    // L appears 3 times (q1, q6, q10), all others appear once or twice
    const req = buildQuizSaveRequest(ALL_ANSWERS);
    expect(req?.resultType).toBe("L");
  });

  it("ignores extra keys that are not valid question ids", () => {
    const withExtra = { ...ALL_ANSWERS, foo: { selectedAnswer: "L" }, q99: { selectedAnswer: "A" } };
    const req = buildQuizSaveRequest(withExtra);
    expect(req).not.toBeNull();
    expect(req?.answers?.foo).toBeUndefined();
  });
});
