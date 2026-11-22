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

describe("managed survey contract", () => {
  it("preserves branding, empty thank-you copy, member completion and custom scale endpoints", async () => {
    getPublicSurvey.mockResolvedValueOnce({
      ...rawSurvey,
      managed_version: 1,
      is_public: false,
      has_responded: true,
      logo_url: "https://images.example.com/logo.png",
      cover_url: "https://images.example.com/banner.png",
      thank_you_message: "",
      questions: [
        {
          ...rawSurvey.questions[0],
          question_type: "scale",
          scale_min: -2,
          scale_max: 8,
          scale_min_label: "低",
          scale_max_label: "高",
          input_type: "text",
        },
      ],
    });
    const result = await getSurveyByShareId("feedback-survey");
    expect(result).toMatchObject({
      managedVersion: 1,
      isPublic: false,
      hasResponded: true,
      logoUrl: "https://images.example.com/logo.png",
      coverUrl: "https://images.example.com/banner.png",
      config: { successMessage: "" },
      questions: [
        {
          questionType: "scale",
          scaleMin: -2,
          scaleMax: 8,
          scaleMinLabel: "低",
          scaleMaxLabel: "高",
        },
      ],
    });
    expect(result.cohortFeedback).toBeUndefined();
  });

  it("submits ranked IDs in selection order and preserves negative scale values and false", async () => {
    submitPublicSurvey.mockResolvedValueOnce({ completed: true });
    await submitResponse({
      externalId: "managed",
      answers: [
        { questionId: "2", value: [15, 12, 14] },
        { questionId: "3", value: -2 },
        { questionId: "4", value: false },
      ],
    });
    expect(submitPublicSurvey).toHaveBeenLastCalledWith("managed", {
      answers: [
        { question_id: 2, selected_option_ids: [15, 12, 14] },
        { question_id: 3, rating_value: -2 },
        { question_id: 4, boolean_value: false },
      ],
    });
  });
});
