import { describe, expect, it, vi } from "vitest";

const getPublicSurvey = vi.fn();
const submitPublicSurvey = vi.fn();
vi.mock("@daodao/api", () => ({
  getPublicSurvey: (...args: unknown[]) => getPublicSurvey(...args),
  submitPublicSurvey: (...args: unknown[]) => submitPublicSurvey(...args),
}));

import { getSurveyByShareId, submitResponse } from "../survey";

const rawSurvey = {
  id: 11,
  external_id: "feedback-survey",
  title: "活動回饋",
  description: "說明",
  status: "active",
  is_anonymous: true,
  max_responses: null,
  tags: ["cohort-feedback"],
  cover_url: null,
  created_by: 9,
  created_at: "2026-11-05T00:00:00Z",
  updated_at: "2026-11-05T00:00:00Z",
  questions: [
    {
      id: 55,
      question_text: "符合期待嗎？",
      question_type: "rating",
      is_required: true,
      position: 0,
      conditions: [],
      options: [],
    },
  ],
};

describe("public survey feedback mapping", () => {
  it("preserves server eligibility and privacy metadata so the page cannot use generic tracking", async () => {
    getPublicSurvey.mockResolvedValueOnce({
      ...rawSurvey,
      cohort_feedback: { state: "login_required", privacy_notice: "僅記錄完成狀態" },
    });
    const result = await getSurveyByShareId("feedback-survey");
    expect(result.cohortFeedback).toEqual({
      state: "login_required",
      privacyNotice: "僅記錄完成狀態",
    });
    expect(result.questions[0]).toMatchObject({
      id: "55",
      questionType: "rating",
      isRequired: true,
    });
    expect(result.shareId).toBe("feedback-survey");
  });

  it("keeps previous surveys on their existing path even if they carry old feedback tags", async () => {
    getPublicSurvey.mockResolvedValueOnce({ ...rawSurvey, is_anonymous: false });
    const result = await getSurveyByShareId("feedback-survey");
    expect(result.cohortFeedback).toBeUndefined();
    expect(result.config.isAnonymous).toBe(false);
  });

  it("serializes a new feedback rating and optional text without tracking data", async () => {
    submitPublicSurvey.mockResolvedValueOnce({ completed: true });
    expect(
      await submitResponse({
        externalId: "feedback-survey",
        answers: [
          { questionId: "55", value: 5 },
          { questionId: "56", value: " 中文 A " },
        ],
      })
    ).toEqual({ completed: true });
    expect(submitPublicSurvey).toHaveBeenLastCalledWith("feedback-survey", {
      answers: [
        { question_id: 55, rating_value: 5 },
        { question_id: 56, answer_text: " 中文 A " },
      ],
    });
  });
});
