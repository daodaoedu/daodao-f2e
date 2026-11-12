import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { USE_PREVIEW_MOCK } from "@/config";
import apiClient from "./client";
import type {
  AdminSurveyAnalytics,
  AdminSurveyAnswerItem,
  AdminSurveyCreatePayload,
  AdminSurveyDetail,
  AdminSurveyListItem,
  AdminSurveyResponse,
  AdminSurveyResponseDetail,
  AdminSurveyUpdatePayload,
  ApiResponse,
  OffsetPagination,
  SurveyStatus,
} from "./types";

interface SurveyListResponse {
  success: boolean;
  data: AdminSurveyListItem[];
  pagination: OffsetPagination;
}

const PREVIEW_SURVEYS_KEY = "daodao-preview-surveys";
const PREVIEW_RESPONSES_KEY = "daodao-preview-survey-responses";
const PREVIEW_SURVEY_ID_KEY = "daodao-preview-next-survey-id";

interface PreviewStoredResponse {
  survey_id: number;
  detail: AdminSurveyResponseDetail;
}

function previewAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: { headers: {} } as InternalAxiosRequestConfig,
    request: {},
  };
}

function readPreviewSurveys(): AdminSurveyDetail[] {
  try {
    const stored = localStorage.getItem(PREVIEW_SURVEYS_KEY);
    const surveys: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(surveys) ? (surveys as AdminSurveyDetail[]) : [];
  } catch {
    return [];
  }
}

export function getPreviewSurveyByExternalId(externalId: string) {
  const survey = readPreviewSurveys().find((item) => item.external_id === externalId);
  if (!survey) return null;
  const responseCount = readPreviewResponses().filter(
    (item) => item.survey_id === survey.id
  ).length;
  return { ...survey, response_count: responseCount };
}

function readPreviewResponses(): PreviewStoredResponse[] {
  try {
    const stored = localStorage.getItem(PREVIEW_RESPONSES_KEY);
    const responses: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(responses) ? (responses as PreviewStoredResponse[]) : [];
  } catch {
    return [];
  }
}

function writePreviewResponses(responses: PreviewStoredResponse[]) {
  localStorage.setItem(PREVIEW_RESPONSES_KEY, JSON.stringify(responses));
}

export async function recordPreviewSurveyResponse(
  externalId: string,
  submittedAnswers: Record<number, string | string[]>
) {
  const lockManager =
    typeof navigator !== "undefined"
      ? (
          navigator as Navigator & {
            locks?: { request<T>(name: string, callback: () => Promise<T>): Promise<T> };
          }
        ).locks
      : undefined;
  const record = () => recordPreviewSurveyResponseLocked(externalId, submittedAnswers);
  return lockManager
    ? lockManager.request(`daodao-survey-response-${externalId}`, record)
    : record();
}

async function recordPreviewSurveyResponseLocked(
  externalId: string,
  submittedAnswers: Record<number, string | string[]>
) {
  const surveys = readPreviewSurveys();
  const surveyIndex = surveys.findIndex((survey) => survey.external_id === externalId);
  if (surveyIndex < 0) throw new Error("找不到本機預覽問卷");

  const survey = surveys[surveyIndex];
  const stored = readPreviewResponses();
  const surveyResponses = stored.filter((item) => item.survey_id === survey.id);
  if (survey.max_responses !== null && surveyResponses.length >= survey.max_responses) {
    throw new Error("此問卷已達最大回應數，暫不接受回應。");
  }
  const responseId =
    surveyResponses.reduce((maxId, item) => Math.max(maxId, item.detail.id), 0) + 1;
  const answers: AdminSurveyAnswerItem[] = survey.questions.map((question) => {
    const rawAnswer = submittedAnswers[question.id];
    const values =
      rawAnswer === undefined ? [] : Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];
    const selectedOptions = question.options
      .filter((option) => values.includes(option.option_text))
      .map((option) => option.option_text);
    const selectedOptionIds = question.options
      .filter((option) => values.includes(option.option_text))
      .map((option) => option.id);
    const numericAnswer =
      question.question_type === "rating" || question.question_type === "scale"
        ? Number(values[0])
        : NaN;
    const answerText = ["text", "email", "link", "ranking"].includes(question.question_type)
      ? values.join(question.question_type === "ranking" ? " → " : "、") || null
      : null;

    return {
      question_id: question.id,
      question_text: question.question_text,
      question_type: question.question_type,
      answer_text: answerText,
      ...(question.question_type === "ranking" ? { ranking_order: values } : {}),
      selected_option_ids: selectedOptionIds,
      selected_options: selectedOptions,
      rating_value: Number.isFinite(numericAnswer) ? numericAnswer : null,
      boolean_value:
        question.question_type === "yesno" ? (values.length > 0 ? values[0] === "是" : null) : null,
    };
  });
  const detail: AdminSurveyResponseDetail = {
    id: responseId,
    user_id: null,
    completed_at: new Date().toISOString(),
    answers,
  };

  writePreviewResponses([...stored, { survey_id: survey.id, detail }]);
  surveys[surveyIndex] = {
    ...survey,
    response_count: surveyResponses.length + 1,
    updated_at: detail.completed_at,
  };
  writePreviewSurveys(surveys);
  return detail;
}

function writePreviewSurveys(surveys: AdminSurveyDetail[]) {
  localStorage.setItem(PREVIEW_SURVEYS_KEY, JSON.stringify(surveys));
}

function previewResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
    pagination: null,
    cacheHit: false,
    processingTime: 0,
    timestamp: new Date().toISOString(),
    requestId: "local-preview",
  };
}

function createPreviewSurvey(data: AdminSurveyCreatePayload) {
  const surveys = readPreviewSurveys();
  const storedNextId = Number(localStorage.getItem(PREVIEW_SURVEY_ID_KEY));
  const maxKnownId = Math.max(
    0,
    ...surveys.map((survey) => survey.id),
    ...readPreviewResponses().map((response) => response.survey_id),
    Number.isSafeInteger(storedNextId) ? storedNextId - 1 : 0
  );
  const id = maxKnownId + 1;
  localStorage.setItem(PREVIEW_SURVEY_ID_KEY, String(id + 1));
  const now = new Date().toISOString();
  const externalId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : `preview-${Date.now().toString(36)}`;
  const survey: AdminSurveyDetail = {
    id,
    external_id: externalId,
    title: data.title,
    status: "draft",
    audience: data.audience ?? "public",
    is_anonymous: data.is_anonymous ?? true,
    tags: data.tags ?? [],
    view_count: 0,
    created_at: now,
    response_count: 0,
    creator: { id: null, email: null, nickname: "本機預覽" },
    description: data.description ?? null,
    thank_you_message: data.thank_you_message ?? null,
    max_responses: data.max_responses ?? null,
    cover_url: data.cover_url ?? null,
    logo_url: data.logo_url ?? null,
    use_default_logo: data.use_default_logo ?? false,
    use_default_banner: data.use_default_banner ?? false,
    updated_at: now,
    questions: (data.questions ?? []).map((question, index) => ({
      id: index + 1,
      question_text: question.question_text,
      question_type: question.question_type,
      is_required: question.is_required,
      position: question.position,
      text_response_length: question.text_response_length,
      scale_min: question.scale_min,
      scale_max: question.scale_max,
      scale_min_label: question.scale_min_label,
      scale_max_label: question.scale_max_label,
      options: question.options.map((option, optionIndex) => ({
        id: optionIndex + 1,
        option_text: option.option_text,
        position: option.position,
      })),
    })),
  };

  writePreviewSurveys([survey, ...surveys]);
  return survey;
}

function updatePreviewSurvey(
  id: number,
  data: AdminSurveyUpdatePayload,
  previewQuestionIdentities?: Array<{ questionId: number | null; optionIds: Array<number | null> }>
) {
  const surveys = readPreviewSurveys();
  const index = surveys.findIndex((survey) => survey.id === id);
  if (index < 0) throw new Error("找不到本機預覽問卷");

  const current = surveys[index];
  const existingQuestionIds = new Set(current.questions.map((question) => question.id));
  const assignedQuestionIds = new Set<number>();
  let nextQuestionId = Math.max(0, ...existingQuestionIds) + 1;
  const updated: AdminSurveyDetail = {
    ...current,
    ...data,
    audience: data.audience ?? current.audience,
    is_anonymous: data.is_anonymous ?? current.is_anonymous,
    tags: data.tags ?? current.tags,
    description: data.description ?? current.description,
    thank_you_message: data.thank_you_message ?? current.thank_you_message,
    max_responses: data.max_responses === undefined ? current.max_responses : data.max_responses,
    cover_url: data.cover_url === undefined ? current.cover_url : data.cover_url,
    logo_url: data.logo_url === undefined ? current.logo_url : data.logo_url,
    use_default_logo:
      data.use_default_logo === undefined ? current.use_default_logo : data.use_default_logo,
    use_default_banner:
      data.use_default_banner === undefined ? current.use_default_banner : data.use_default_banner,
    updated_at: new Date().toISOString(),
    questions:
      data.questions?.map((question, questionIndex) => {
        const requestedId = previewQuestionIdentities?.[questionIndex]?.questionId;
        const questionId =
          requestedId !== null &&
          requestedId !== undefined &&
          existingQuestionIds.has(requestedId) &&
          !assignedQuestionIds.has(requestedId)
            ? requestedId
            : nextQuestionId++;
        assignedQuestionIds.add(questionId);
        const existingQuestion = current.questions.find((item) => item.id === questionId);
        const existingOptionIds = new Set(
          existingQuestion?.options.map((option) => option.id) ?? []
        );
        const assignedOptionIds = new Set<number>();
        let nextOptionId = Math.max(0, ...existingOptionIds) + 1;
        return {
          id: questionId,
          question_text: question.question_text,
          question_type: question.question_type,
          is_required: question.is_required,
          position: question.position,
          text_response_length: question.text_response_length,
          scale_min: question.scale_min,
          scale_max: question.scale_max,
          scale_min_label: question.scale_min_label,
          scale_max_label: question.scale_max_label,
          options: question.options.map((option, optionIndex) => {
            const requestedOptionId =
              previewQuestionIdentities?.[questionIndex]?.optionIds[optionIndex];
            const optionId =
              requestedOptionId !== null &&
              requestedOptionId !== undefined &&
              existingOptionIds.has(requestedOptionId) &&
              !assignedOptionIds.has(requestedOptionId)
                ? requestedOptionId
                : nextOptionId++;
            assignedOptionIds.add(optionId);
            return {
              id: optionId,
              option_text: option.option_text,
              position: option.position,
            };
          }),
        };
      }) ?? current.questions,
  };
  surveys[index] = updated;
  writePreviewSurveys(surveys);
  return updated;
}

interface SurveyResponseListResponse {
  success: boolean;
  data: AdminSurveyResponse[];
  pagination: OffsetPagination;
}

export const listAdminSurveys = (params?: {
  status?: SurveyStatus;
  q?: string;
  limit?: number;
  offset?: number;
}) => {
  if (USE_PREVIEW_MOCK) {
    const filtered = readPreviewSurveys().filter((survey) => {
      const matchesStatus = !params?.status || survey.status === params.status;
      const matchesQuery =
        !params?.q || survey.title.toLowerCase().includes(params.q.toLowerCase());
      return matchesStatus && matchesQuery;
    });
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 20;
    const data = filtered
      .slice(offset, offset + limit)
      .map(({ questions: _questions, ...survey }) => survey);
    const response: SurveyListResponse = {
      success: true,
      data,
      pagination: {
        total_count: filtered.length,
        limit,
        offset,
        has_next: offset + data.length < filtered.length,
      },
    };
    return Promise.resolve(previewAxiosResponse(response));
  }
  return apiClient.get<SurveyListResponse>("/daodao-server/api/v1/admin/surveys", { params });
};

export const getAdminSurvey = (id: number) => {
  if (USE_PREVIEW_MOCK) {
    const survey = readPreviewSurveys().find((item) => item.id === id);
    if (!survey) throw new Error("找不到本機預覽問卷");
    return Promise.resolve(previewAxiosResponse(previewResponse(survey)));
  }
  return apiClient.get<ApiResponse<AdminSurveyDetail>>(`/daodao-server/api/v1/admin/surveys/${id}`);
};

export const updateAdminSurveyStatus = (id: number, status: SurveyStatus) => {
  if (USE_PREVIEW_MOCK) {
    const surveys = readPreviewSurveys();
    const index = surveys.findIndex((survey) => survey.id === id);
    if (index < 0) throw new Error("找不到本機預覽問卷");
    surveys[index] = { ...surveys[index], status, updated_at: new Date().toISOString() };
    writePreviewSurveys(surveys);
    return Promise.resolve(
      previewAxiosResponse(previewResponse({ id, status, updated_at: surveys[index].updated_at }))
    );
  }
  return apiClient.patch<ApiResponse<{ id: number; status: SurveyStatus; updated_at: string }>>(
    `/daodao-server/api/v1/admin/surveys/${id}/status`,
    { status }
  );
};

export const deleteAdminSurvey = (id: number) => {
  if (USE_PREVIEW_MOCK) {
    writePreviewSurveys(readPreviewSurveys().filter((survey) => survey.id !== id));
    writePreviewResponses(readPreviewResponses().filter((response) => response.survey_id !== id));
    return Promise.resolve(previewAxiosResponse(previewResponse({ id })));
  }
  return apiClient.delete(`/daodao-server/api/v1/admin/surveys/${id}`);
};

export const listAdminSurveyResponses = (
  id: number,
  params?: { limit?: number; offset?: number }
) => {
  if (USE_PREVIEW_MOCK) {
    const allResponses = readPreviewResponses()
      .filter((item) => item.survey_id === id)
      .map(({ detail }) => ({
        id: detail.id,
        user_id: detail.user_id,
        completed_at: detail.completed_at,
        answer_count: detail.answers.filter(
          (answer) =>
            answer.answer_text !== null ||
            answer.selected_options.length > 0 ||
            answer.rating_value != null ||
            answer.boolean_value !== null ||
            Boolean(answer.ranking_order?.length)
        ).length,
      }))
      .sort((a, b) => b.completed_at.localeCompare(a.completed_at));
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 20;
    const data: SurveyResponseListResponse = {
      success: true,
      data: allResponses.slice(offset, offset + limit),
      pagination: {
        total_count: allResponses.length,
        limit,
        offset,
        has_next: offset + limit < allResponses.length,
      },
    };
    return Promise.resolve(previewAxiosResponse(data));
  }
  return apiClient.get<SurveyResponseListResponse>(
    `/daodao-server/api/v1/admin/surveys/${id}/responses`,
    {
      params,
    }
  );
};

export const deleteAdminSurveyResponse = (surveyId: number, responseId: number) => {
  if (USE_PREVIEW_MOCK) {
    const responses = readPreviewResponses().filter(
      (item) => !(item.survey_id === surveyId && item.detail.id === responseId)
    );
    writePreviewResponses(responses);
    const surveys = readPreviewSurveys();
    const surveyIndex = surveys.findIndex((survey) => survey.id === surveyId);
    if (surveyIndex >= 0) {
      surveys[surveyIndex] = {
        ...surveys[surveyIndex],
        response_count: responses.filter((item) => item.survey_id === surveyId).length,
        updated_at: new Date().toISOString(),
      };
      writePreviewSurveys(surveys);
    }
    return Promise.resolve(previewAxiosResponse(previewResponse({ id: responseId })));
  }
  return apiClient.delete(
    `/daodao-server/api/v1/admin/surveys/${surveyId}/responses/${responseId}`
  );
};

export const createAdminSurvey = (data: AdminSurveyCreatePayload) => {
  if (USE_PREVIEW_MOCK) {
    const survey = createPreviewSurvey(data);
    return Promise.resolve(
      previewAxiosResponse(previewResponse({ id: survey.id, external_id: survey.external_id }))
    );
  }
  return apiClient.post<ApiResponse<{ id: number; external_id: string }>>(
    "/daodao-server/api/v1/admin/surveys",
    data
  );
};

export const updateAdminSurvey = (
  id: number,
  data: AdminSurveyUpdatePayload,
  previewQuestionIdentities?: Array<{ questionId: number | null; optionIds: Array<number | null> }>
) => {
  if (USE_PREVIEW_MOCK) {
    const survey = updatePreviewSurvey(id, data, previewQuestionIdentities);
    return Promise.resolve(previewAxiosResponse(previewResponse({ id: survey.id, updated: true })));
  }
  return apiClient.put<ApiResponse<{ id: number; updated: boolean }>>(
    `/daodao-server/api/v1/admin/surveys/${id}`,
    data
  );
};

export const getAdminSurveyResponseDetail = (surveyId: number, responseId: number) => {
  if (USE_PREVIEW_MOCK) {
    const response = readPreviewResponses().find(
      (item) => item.survey_id === surveyId && item.detail.id === responseId
    )?.detail;
    if (!response) throw new Error("找不到本機預覽回應");
    return Promise.resolve(previewAxiosResponse(previewResponse(response)));
  }
  return apiClient.get<ApiResponse<AdminSurveyResponseDetail>>(
    `/daodao-server/api/v1/admin/surveys/${surveyId}/responses/${responseId}`
  );
};

export const getAdminSurveyAnalytics = (id: number) => {
  if (USE_PREVIEW_MOCK) {
    const survey = readPreviewSurveys().find((item) => item.id === id);
    if (!survey) throw new Error("找不到本機預覽問卷");
    const details = readPreviewResponses()
      .filter((item) => item.survey_id === id)
      .map((item) => item.detail);
    const perQuestion = survey.questions.map((question) => {
      const answerItems = details
        .map((response) => response.answers.find((answer) => answer.question_id === question.id))
        .filter((answer): answer is AdminSurveyAnswerItem => Boolean(answer));
      const answered = answerItems.filter(
        (answer) =>
          answer.answer_text !== null ||
          answer.selected_options.length > 0 ||
          answer.rating_value != null ||
          answer.boolean_value !== null ||
          Boolean(answer.ranking_order?.length)
      );
      const numbers = answered.flatMap((answer) => {
        const storedValue = answer.rating_value == null ? NaN : Number(answer.rating_value);
        if (Number.isFinite(storedValue)) return [storedValue];
        // Older locally saved preview responses may have the numeric value in
        // answer_text or selected_options instead of rating_value.
        const legacyValue = Number(answer.answer_text ?? answer.selected_options[0]);
        return Number.isFinite(legacyValue) ? [legacyValue] : [];
      });
      const stats: AdminSurveyAnalytics["per_question"][number]["stats"] = {};

      if (
        question.question_type === "single_choice" ||
        question.question_type === "multiple_choice"
      ) {
        stats.option_counts = question.options.map((option) => ({
          option_id: option.id,
          option_text: option.option_text,
          count: answered.filter((answer) => answer.selected_option_ids.includes(option.id)).length,
        }));
      } else if (question.question_type === "yesno") {
        stats.true = answered.filter((answer) => answer.boolean_value === true).length;
        stats.false = answered.filter((answer) => answer.boolean_value === false).length;
      } else if (question.question_type === "rating" || question.question_type === "scale") {
        stats.avg = numbers.length
          ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length
          : null;
        stats.min = numbers.length ? Math.min(...numbers) : null;
        stats.max = numbers.length ? Math.max(...numbers) : null;
      } else if (question.question_type === "ranking") {
        const optionTexts = question.options.length
          ? question.options.map((option) => option.option_text)
          : [
              ...new Set(
                answered.flatMap(
                  (answer) =>
                    answer.ranking_order ?? (answer.answer_text ?? "").split(" → ").filter(Boolean)
                )
              ),
            ];
        const maxRank = Math.max(
          question.options.length,
          ...answered.map(
            (answer) =>
              answer.ranking_order?.length ??
              (answer.answer_text ?? "").split(" → ").filter(Boolean).length
          ),
          1
        );
        stats.ranking_option_stats = optionTexts.map((optionText) => {
          const rankCounts = Array.from(
            { length: maxRank },
            (_, rankIndex) =>
              answered.filter((answer) => {
                const order = answer.ranking_order?.length
                  ? answer.ranking_order
                  : (answer.answer_text ?? "").split(" → ").filter(Boolean);
                return order[rankIndex] === optionText;
              }).length
          );
          const rankedResponses = rankCounts.reduce((sum, count) => sum + count, 0);
          const weightedRankTotal = rankCounts.reduce(
            (sum, count, rankIndex) => sum + count * (rankIndex + 1),
            0
          );
          return {
            option_text: optionText,
            rank_counts: rankCounts,
            avg_rank: rankedResponses ? weightedRankTotal / rankedResponses : null,
          };
        });
      } else {
        stats.sample_answers = answered
          .map((answer) => answer.answer_text)
          .filter((answer): answer is string => Boolean(answer))
          .slice(0, 5);
      }

      return {
        question_id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        answer_count: answered.length,
        stats,
      };
    });
    const data: AdminSurveyAnalytics = {
      survey_id: id,
      response_count: details.length,
      view_count: survey.view_count,
      avg_duration_seconds: null,
      drop_off: [],
      per_question: perQuestion,
    };
    return Promise.resolve(previewAxiosResponse(previewResponse(data)));
  }
  return apiClient
    .get<ApiResponse<AdminSurveyAnalytics>>(`/daodao-server/api/v1/admin/surveys/${id}/analytics`)
    .then(async (response) => {
      const analytics = response.data.data;
      const ratingQuestions = analytics.per_question.filter(
        (question) =>
          question.question_type === "rating" &&
          question.answer_count > 0 &&
          question.stats.avg == null
      );
      if (!ratingQuestions.length) return response;

      try {
        const responses: Array<{ id: number }> = [];
        let offset = 0;
        let hasNext = true;
        while (hasNext) {
          const page = await listAdminSurveyResponses(id, { limit: 100, offset });
          responses.push(...page.data.data.map(({ id: responseId }) => ({ id: responseId })));
          hasNext = page.data.pagination.has_next;
          offset += page.data.pagination.limit;
        }

        const details = await Promise.all(
          responses.map(({ id: responseId }) =>
            getAdminSurveyResponseDetail(id, responseId)
              .then((detail) => detail.data.data)
              .catch(() => null)
          )
        );

        for (const question of ratingQuestions) {
          const values = details.flatMap((detail) => {
            const answer = detail?.answers.find(
              (item) => item.question_id === question.question_id
            );
            if (!answer) return [];
            const ratingValue = answer.rating_value == null ? NaN : Number(answer.rating_value);
            if (Number.isFinite(ratingValue)) return [ratingValue];
            const text = answer.answer_text ?? answer.selected_options[0] ?? "";
            const starCount = (text.match(/★/g) ?? []).length;
            const parsedValue = starCount || Number(text.match(/\d+(?:\.\d+)?/)?.[0]);
            return Number.isFinite(parsedValue) && parsedValue > 0 ? [parsedValue] : [];
          });
          if (!values.length) continue;
          question.answer_count = values.length;
          question.stats.avg = values.reduce((sum, value) => sum + value, 0) / values.length;
          question.stats.min = Math.min(...values);
          question.stats.max = Math.max(...values);
        }
      } catch {
        // Keep the analytics response available if detail lookup is unsupported.
      }

      return response;
    });
};
