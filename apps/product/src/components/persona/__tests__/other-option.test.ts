import { describe, expect, it } from "vitest";
import { buildPersonaAnswerBody } from "../other-option-utils";

describe("buildPersonaAnswerBody", () => {
  const qId = 42;

  it("choice + regular option → selectedValue", () => {
    const body = buildPersonaAnswerBody(qId, true, "選項一", "", false, "");
    expect(body).toEqual({ questionId: qId, selectedValue: "選項一" });
  });

  it("choice + custom answer with text → textAnswer", () => {
    const body = buildPersonaAnswerBody(qId, true, "", "", true, "自訂答案");
    expect(body).toEqual({ questionId: qId, textAnswer: "自訂答案" });
  });

  it("choice + custom answer without text → textAnswer: undefined", () => {
    const body = buildPersonaAnswerBody(qId, true, "", "", true, "");
    expect(body).toEqual({ questionId: qId, textAnswer: undefined });
  });

  it("non-choice + text → textAnswer", () => {
    const body = buildPersonaAnswerBody(qId, false, "", "my answer", false, "");
    expect(body).toEqual({ questionId: qId, textAnswer: "my answer" });
  });

  it("non-choice + empty text → textAnswer: undefined", () => {
    const body = buildPersonaAnswerBody(qId, false, "", "  ", false, "");
    expect(body).toEqual({ questionId: qId, textAnswer: undefined });
  });
});
