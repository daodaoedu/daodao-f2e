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
export type PersonaResonanceData = components["schemas"]["PersonaResonanceData"];
export type PersonaCarouselState = components["schemas"]["PersonaCarouselState"];

export type SubmitPersonaAnswerBody = components["schemas"]["SubmitPersonaAnswerBody"];
export type SubmitPersonaSkipBody = components["schemas"]["SubmitPersonaSkipBody"];
export type AddPersonaResonanceBody = components["schemas"]["AddPersonaResonanceBody"];

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

export const getPersonaQuestions = async () => {
  return client.GET("/api/v1/persona/questions");
};

export const submitPersonaAnswer = async (body: SubmitPersonaAnswerBody) => {
  return client.POST("/api/v1/persona/answers", { body });
};

export const submitPersonaSkip = async (body: SubmitPersonaSkipBody) => {
  return client.POST("/api/v1/persona/skips", { body });
};

export const addPersonaResonance = async (body: AddPersonaResonanceBody) => {
  return client.POST("/api/v1/persona/resonances", { body });
};

export const removePersonaResonance = async (answerId: number) => {
  return client.DELETE("/api/v1/persona/resonances/{answerId}", {
    params: { path: { answerId } },
  });
};

export const getPersonaCarouselState = async (replace?: number) => {
  return client.GET("/api/v1/persona/carousel-state", {
    params: { query: replace != null ? { replace } : undefined },
  });
};

export const dismissPersonaCarousel = async () => {
  return client.POST("/api/v1/persona/carousel-dismiss");
};

export const getPersonaProfileMe = async () => {
  return client.GET("/api/v1/persona/profile/me");
};

export const getPersonaProfileUser = async (userId: string, exclude?: number) => {
  return client.GET("/api/v1/persona/profile/{userId}", {
    params: {
      path: { userId },
      query: exclude != null ? { exclude } : undefined,
    },
  });
};
