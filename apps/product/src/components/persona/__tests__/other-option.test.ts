import { describe, expect, it } from "vitest";
import {
  OTHER_OPTION_VALUE,
  buildPersonaAnswerBody,
  isOtherOption,
} from "../other-option-utils";

describe("isOtherOption", () => {
  it("returns true for 其他", () => {
    expect(isOtherOption("其他")).toBe(true);
  });

  it("returns false for a regular option", () => {
    expect(isOtherOption("選項A")).toBe(false);
    expect(isOtherOption("")).toBe(false);
  });

  it("exports the constant that equals 其他", () => {
    expect(OTHER_OPTION_VALUE).toBe("其他");
  });
});

describe("buildPersonaAnswerBody", () => {
  const qId = 42;

  it("choice + regular option → selectedValue", () => {
    const body = buildPersonaAnswerBody(qId, true, "選項一", "", "");
    expect(body).toEqual({ questionId: qId, selectedValue: "選項一" });
  });

  it("choice + 其他 + filled otherText → textAnswer with custom text", () => {
    const body = buildPersonaAnswerBody(qId, true, "其他", "", "自訂答案");
    expect(body).toEqual({ questionId: qId, textAnswer: "自訂答案" });
  });

  it("choice + 其他 + empty otherText → textAnswer: undefined", () => {
    const body = buildPersonaAnswerBody(qId, true, "其他", "", "");
    expect(body).toEqual({ questionId: qId, textAnswer: undefined });
  });

  it("non-choice + text → textAnswer", () => {
    const body = buildPersonaAnswerBody(qId, false, "", "my answer", "");
    expect(body).toEqual({ questionId: qId, textAnswer: "my answer" });
  });

  it("non-choice + empty text → textAnswer: undefined", () => {
    const body = buildPersonaAnswerBody(qId, false, "", "  ", "");
    expect(body).toEqual({ questionId: qId, textAnswer: undefined });
  });
});
