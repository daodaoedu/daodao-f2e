import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config", () => ({ USE_PREVIEW_MOCK: true }));

import {
  createAdminSurvey,
  deleteAdminSurvey,
  getAdminSurvey,
  getAdminSurveyResponseDetail,
  recordPreviewSurveyResponse,
  updateAdminSurvey,
  updateAdminSurveyStatus,
} from "./admin-survey";
import type { AdminSurveyCreatePayload } from "./types";

const question = (
  question_text: string,
  question_type = "text",
  options: Array<{ option_text: string; position: number }> = []
) => ({
  question_text,
  question_type,
  is_required: false,
  position: 1,
  text_response_length: "short" as const,
  options,
});

async function createSurvey(overrides: Partial<AdminSurveyCreatePayload> = {}) {
  const payload: AdminSurveyCreatePayload = {
    title: "測試問卷",
    questions: [question("問題一"), question("問題二")],
    ...overrides,
  };
  const response = await createAdminSurvey(payload);
  return response.data.data;
}

beforeEach(() => localStorage.clear());

describe("survey preview data integrity", () => {
  it("enforces the response cap against stored responses", async () => {
    const { id, external_id } = await createSurvey({ max_responses: 1 });
    await updateAdminSurveyStatus(id, "active");

    await recordPreviewSurveyResponse(external_id, { 1: "first response" });
    await expect(
      recordPreviewSurveyResponse(external_id, { 1: "second response" })
    ).rejects.toThrow("已達最大回應數");
  });

  it("allows only one response when submissions race at the final response slot", async () => {
    const { id, external_id } = await createSurvey({ max_responses: 1 });
    await updateAdminSurveyStatus(id, "active");

    const results = await Promise.allSettled([
      recordPreviewSurveyResponse(external_id, { 1: "first" }),
      recordPreviewSurveyResponse(external_id, { 1: "second" }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
  });

  it("keeps question IDs stable across reorder and never reuses a deleted survey ID", async () => {
    const { id, external_id } = await createSurvey();
    await updateAdminSurveyStatus(id, "active");
    const response = await recordPreviewSurveyResponse(external_id, {
      1: "answer one",
      2: "answer two",
    });

    await updateAdminSurvey(
      id,
      {
        questions: [question("問題二"), question("問題一")],
      },
      [
        { questionId: 2, optionIds: [] },
        { questionId: 1, optionIds: [] },
      ]
    );
    const updated = await getAdminSurvey(id);
    expect(updated.data.data.questions.map((item) => item.id)).toEqual([2, 1]);
    const savedResponse = await getAdminSurveyResponseDetail(id, response.id);
    expect(savedResponse.data.data.answers.map((answer) => answer.question_id)).toEqual([1, 2]);

    await deleteAdminSurvey(id);
    expect(localStorage.getItem("daodao-preview-survey-responses")).toBe("[]");
    const replacement = await createSurvey();
    expect(replacement.id).toBeGreaterThan(id);
  });

  it("keeps option IDs stable when existing choices are reordered or new choices are added", async () => {
    const choiceQuestion = question("選擇題", "single", [
      { option_text: "選項甲", position: 0 },
      { option_text: "選項乙", position: 1 },
    ]);
    const { id, external_id } = await createSurvey({ questions: [choiceQuestion] });
    await updateAdminSurveyStatus(id, "active");
    const response = await recordPreviewSurveyResponse(external_id, { 1: "選項甲" });

    await updateAdminSurvey(
      id,
      {
        questions: [
          question("選擇題", "single", [
            { option_text: "選項乙", position: 0 },
            { option_text: "選項甲", position: 1 },
            { option_text: "選項丙", position: 2 },
          ]),
        ],
      },
      [{ questionId: 1, optionIds: [2, 1, null] }]
    );

    const updated = await getAdminSurvey(id);
    expect(updated.data.data.questions[0].options.map((option) => option.id)).toEqual([2, 1, 3]);
    const savedResponse = await getAdminSurveyResponseDetail(id, response.id);
    expect(savedResponse.data.data.answers[0].selected_option_ids).toEqual([1]);
  });
});
