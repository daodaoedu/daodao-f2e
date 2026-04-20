import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FeedbackState } from "../services/recommendation-hooks";
import { submitRecommendationFeedback } from "../services/recommendation-hooks";

// ============================================================================
// submitRecommendationFeedback 契約測試
// ============================================================================

describe("submitRecommendationFeedback", () => {
  const mockBaseUrl = "https://ai.example.com";

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_AI_API_URL", mockBaseUrl);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("成功時回傳 feedbackState", async () => {
    const mockResponse: {
      success: boolean;
      data: { practiceId: string; feedbackState: FeedbackState };
    } = {
      success: true,
      data: { practiceId: "ext-10", feedbackState: "liked" },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const state = await submitRecommendationFeedback("ext-10", "like");

    expect(state).toBe("liked");
    expect(fetch).toHaveBeenCalledWith(
      `${mockBaseUrl}/api/v1/recommendation/topic_cards/ext-10/feedback`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ feedbackType: "like" }),
      })
    );
  });

  it("dislike 回傳 disliked feedbackState", async () => {
    const mockResponse = {
      success: true,
      data: { practiceId: "ext-20", feedbackState: "disliked" as FeedbackState },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const state = await submitRecommendationFeedback("ext-20", "dislike");
    expect(state).toBe("disliked");
  });

  it("toggle（data.feedbackState 為 neutral）時回傳 neutral", async () => {
    const mockResponse = {
      success: true,
      data: { practiceId: "ext-10", feedbackState: "neutral" as FeedbackState },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const state = await submitRecommendationFeedback("ext-10", "like");
    expect(state).toBe("neutral");
  });

  it("data 為 undefined 時回傳 neutral（fallback）", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const state = await submitRecommendationFeedback("ext-10", "like");
    expect(state).toBe("neutral");
  });

  it("HTTP 失敗時 throw Error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    await expect(submitRecommendationFeedback("ext-bad", "like")).rejects.toThrow(
      "Feedback failed: 404"
    );
  });

  it("網路錯誤時 throw Error", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    await expect(submitRecommendationFeedback("ext-10", "like")).rejects.toThrow("Network error");
  });
});
