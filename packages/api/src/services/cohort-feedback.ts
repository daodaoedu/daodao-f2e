"use client";

import { client } from "../client";
import { apiErrorFromBody } from "../errors";
import type { components, paths } from "../types";

export type CohortFeedbackType = components["schemas"]["CohortFeedbackResponse"];
export type CohortFeedbackStateType = CohortFeedbackType["state"];
export type CohortFeedbackFilterType = NonNullable<
  NonNullable<
    paths["/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/feedback"]["get"]["parameters"]["query"]
  >["status"]
>;

/** Fetch only the cohort owner's view; the server enforces owner and cohort association. */
export async function getCohortFeedback(
  programId: number,
  cohortId: number,
  status: CohortFeedbackFilterType = "all",
  page = 1
): Promise<CohortFeedbackType> {
  const result = await client.GET(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/feedback",
    { params: { path: { programId, cohortId }, query: { status, page } } }
  );
  if (result.error || !result.data) {
    throw apiErrorFromBody(result.response.status, result.error, "無法載入學員回饋");
  }
  return result.data.data;
}

/** Use the shared authenticated client for public survey access, including login cookies. */
export async function getPublicSurvey(externalId: string) {
  const result = await client.GET("/api/v1/surveys/public/{externalId}", {
    params: { path: { externalId } },
  });
  if (result.error || !result.data) {
    throw apiErrorFromBody(result.response.status, result.error, "無法載入問卷");
  }
  return result.data.data;
}

type PublicSurveySubmissionType = NonNullable<
  paths["/api/v1/surveys/public/{externalId}/responses"]["post"]["requestBody"]
>["content"]["application/json"];

/** Feedback submissions contain no tracking identifiers or timestamps. */
export async function submitPublicSurvey(externalId: string, body: PublicSurveySubmissionType) {
  const result = await client.POST("/api/v1/surveys/public/{externalId}/responses", {
    params: { path: { externalId } },
    body,
  });
  if (result.error || !result.data) {
    throw apiErrorFromBody(result.response.status, result.error, "問卷提交失敗");
  }
  return result.data.data;
}
