import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@daodao/config", () => ({ getRequiredEnv: () => "https://feedback.example" }));

import {
  getCohortFeedback,
  getPublicSurvey,
  submitPublicSurvey,
} from "../services/cohort-feedback";

const response = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

function firstRequest(requests: Request[]): Request {
  const request = requests[0];
  if (!request) throw new Error("Expected an outgoing HTTP request");
  return request;
}

/** Exercise actual openapi-fetch serialization rather than mocking the domain service. */
describe("cohort feedback wire contract", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the signed-in learner's survey using cookies on the existing public route", async () => {
    const body = {
      success: true,
      data: {
        title: "活動回饋",
        cohort_feedback: { state: "ready", privacy_notice: "登入只記錄完成狀態" },
      },
    };
    const requests: Request[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      requests.push(new Request(input, init));
      return response(200, body);
    });
    expect(await getPublicSurvey("survey-471")).toEqual(body.data);
    expect(requests).toHaveLength(1);
    expect(firstRequest(requests).url).toBe(
      "https://feedback.example/api/v1/surveys/public/survey-471"
    );
    expect(firstRequest(requests).credentials).toBe("include");
  });

  it("submits a rating and Chinese text without session or timestamp fields", async () => {
    const requests: Request[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      requests.push(new Request(input, init));
      return response(201, { success: true, data: { completed: true } });
    });
    expect(
      await submitPublicSurvey("survey-471", {
        answers: [
          { question_id: 1, rating_value: 4 },
          { question_id: 2, answer_text: "  中文 A 測試  " },
        ],
      })
    ).toEqual({ completed: true });
    expect(requests).toHaveLength(1);
    expect(firstRequest(requests).method).toBe("POST");
    expect(firstRequest(requests).credentials).toBe("include");
    const body = await firstRequest(requests).json();
    expect(body).toEqual({
      answers: [
        { question_id: 1, rating_value: 4 },
        { question_id: 2, answer_text: "  中文 A 測試  " },
      ],
    });
    expect(body).not.toHaveProperty("session_key");
    expect(body).not.toHaveProperty("started_at");
    expect(body).not.toHaveProperty("user_id");
  });

  it("sends completion filters and page to the cohort-specific owner endpoint", async () => {
    const requests: Request[] = [];
    const payload = {
      state: "waiting",
      completedCount: 0,
      eligibleCount: 7,
      participants: [],
      pagination: { page: 2, pageSize: 5, total: 7, totalPages: 2 },
      ratingDistribution: [],
      totalResponses: 0,
      textQuestions: [],
    };
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      requests.push(new Request(input, init));
      return response(200, { success: true, data: payload });
    });
    expect(await getCohortFeedback(12, 34, "pending", 2)).toEqual(payload);
    const url = new URL(firstRequest(requests).url);
    expect(url.pathname).toBe("/api/v1/lighthouse/programs/12/cohorts/34/feedback");
    expect(url.searchParams.get("status")).toBe("pending");
    expect(url.searchParams.get("page")).toBe("2");
  });

  it("preserves forbidden and duplicate statuses for distinct UI states", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        response(403, { success: false, error: { code: "FORBIDDEN", message: "無權限" } })
      )
      .mockResolvedValueOnce(
        response(409, { success: false, error: { code: "CONFLICT", message: "已完成" } })
      );
    await expect(getCohortFeedback(12, 34)).rejects.toMatchObject({
      status: 403,
      data: { code: "FORBIDDEN" },
    });
    await expect(
      submitPublicSurvey("survey-471", { answers: [{ question_id: 1, rating_value: 5 }] })
    ).rejects.toMatchObject({ status: 409, data: { code: "CONFLICT" } });
  });
});
