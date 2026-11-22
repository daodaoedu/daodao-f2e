import { describe, expect, it } from "vitest";
import { formatCheckInDescription, parseCheckInDescription } from "../description-answers";
import { createCheckInFormSchema } from "../schema";

const base = { mood: "happy", tags: ["reading"], media: [], nextStep: "" };

describe("check-in description wire and editing contract", () => {
  it("rejects the combined note when the next-step heading would exceed the API's 600 characters", () => {
    const values = { ...base, actionObservation: "甲".repeat(600), nextStep: "乙" };
    expect(createCheckInFormSchema().safeParse(values).success).toBe(false);
  });

  it("rejects English notes over 600 characters even when they contain fewer than 300 words", () => {
    const values = { ...base, actionObservation: "reading ".repeat(100).trim() };
    expect(createCheckInFormSchema(undefined, "en").safeParse(values).success).toBe(false);
  });

  it("accepts a 600-character action when no next step is added", () => {
    expect(
      createCheckInFormSchema().safeParse({ ...base, actionObservation: "甲".repeat(600) }).success
    ).toBe(true);
  });

  it("allows editing a legacy empty note without inventing required text", () => {
    expect(
      createCheckInFormSchema(undefined, "zh-TW", { isEditing: true }).safeParse({
        ...base,
        actionObservation: "",
      }).success
    ).toBe(true);
  });

  it("allows a valid two-part note to be edited in English without treating its combined text as one new 300-word answer", () => {
    const existing = formatCheckInDescription(
      { actionObservation: "我".repeat(150), nextStep: "我".repeat(150) },
      { nextStep: "What might you adjust or try next time?" }
    );
    expect(existing.length).toBeLessThanOrEqual(600);
    expect(
      createCheckInFormSchema(undefined, "en", { isEditing: true }).safeParse({
        ...base,
        ...parseCheckInDescription(existing),
      }).success
    ).toBe(true);
  });

  it("still requires observation text for a new check-in", () => {
    expect(createCheckInFormSchema().safeParse({ ...base, actionObservation: "" }).success).toBe(
      false
    );
  });

  it.each([
    "今天的閱讀筆記\nWhat did you try?\nI read a book.",
    "  紀錄你的行動\n我的原始筆記\n下次可以做什麼調整或嘗試？\n保留使用者打下的標題  ",
    "",
  ])("preserves existing free text verbatim across an edit roundtrip: %j", (description) => {
    expect(
      formatCheckInDescription(parseCheckInDescription(description), {
        nextStep: "下次可以做什麼調整或嘗試？",
      })
    ).toBe(description);
  });
});
