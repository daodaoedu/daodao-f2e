/**
 * Persona API Service
 * 提供學習人物誌相關的 API 調用函數
 */

import { client } from "../client";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

export type PersonaQuestionItem = components["schemas"]["PersonaQuestionItem"];
export type PersonaAnswerItem = components["schemas"]["PersonaAnswerItem"];
export type PersonaCarouselState = components["schemas"]["PersonaCarouselState"];
export type PersonaQuestionAnswerItem = components["schemas"]["QuestionAnswerItem"];
export type PersonaQuestionAnswersData = components["schemas"]["QuestionAnswersData"];

export type SubmitPersonaAnswerBody = components["schemas"]["SubmitPersonaAnswerBody"];
export type SubmitPersonaSkipBody = components["schemas"]["SubmitPersonaSkipBody"];

type PersonaLocale = "zh-TW" | "en";

export type GetPersonaQuestionsResponse =
  paths["/api/v1/persona/questions"]["get"]["responses"]["200"]["content"]["application/json"];

export type GetCarouselStateResponse =
  paths["/api/v1/persona/carousel-state"]["get"]["responses"]["200"]["content"]["application/json"];

export type GetProfileMeResponse =
  paths["/api/v1/persona/profile/me"]["get"]["responses"]["200"]["content"]["application/json"];

export type GetProfileUserResponse =
  paths["/api/v1/persona/profile/{userId}"]["get"]["responses"]["200"]["content"]["application/json"];

// ============================================================================
// Client Functions
// ============================================================================

export const getPersonaQuestions = async (locale?: string) => {
  return client.GET("/api/v1/persona/questions", {
    params: { query: locale ? { locale: locale as PersonaLocale } : undefined },
  });
};

export const submitPersonaAnswer = async (body: SubmitPersonaAnswerBody) => {
  return client.POST("/api/v1/persona/answers", { body });
};

export const submitPersonaSkip = async (body: SubmitPersonaSkipBody) => {
  return client.POST("/api/v1/persona/skips", { body });
};

export const getPersonaCarouselState = async (replace?: number, locale?: string) => {
  return client.GET("/api/v1/persona/carousel-state", {
    params: {
      query: {
        ...(replace != null ? { replace } : {}),
        ...(locale ? { locale: locale as PersonaLocale } : {}),
      },
    },
  });
};

export const dismissPersonaCarousel = async () => {
  return client.POST("/api/v1/persona/carousel-dismiss");
};

export const getPersonaProfileMe = async (locale?: string) => {
  return client.GET("/api/v1/persona/profile/me", {
    params: { query: locale ? { locale: locale as PersonaLocale } : undefined },
  });
};

export const getPersonaQuestionAnswers = async (
  questionId: number,
  options?: { locale?: string; limit?: number; cursor?: number }
) => {
  return client.GET("/api/v1/persona/questions/{questionId}/answers", {
    params: {
      path: { questionId },
      query: {
        ...(options?.locale ? { locale: options.locale as PersonaLocale } : {}),
        ...(options?.limit != null ? { limit: options.limit } : {}),
        ...(options?.cursor != null ? { cursor: options.cursor } : {}),
      },
    },
  });
};

export const getPersonaProfileUser = async (userId: string, exclude?: number, locale?: string) => {
  return client.GET("/api/v1/persona/profile/{userId}", {
    params: {
      path: { userId },
      query: {
        ...(exclude != null ? { exclude } : {}),
        ...(locale ? { locale: locale as PersonaLocale } : {}),
      },
    },
  });
};
