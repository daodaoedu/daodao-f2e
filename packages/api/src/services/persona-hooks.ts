"use client";

/**
 * Persona API Hooks
 * 提供學習人物誌相關的 React Hooks（用於 Client Components）
 */

import { useQuery } from "../hooks";

// ============================================================================
// Query Hooks
// ============================================================================

export const usePersonaQuestions = (locale?: string, options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  return useQuery(
    "/api/v1/persona/questions",
    enabled ? { params: { query: locale ? { locale } : undefined } } : null
  );
};

export const usePersonaCarouselState = (replace?: number, locale?: string) => {
  return useQuery("/api/v1/persona/carousel-state", {
    params: {
      query: {
        ...(replace != null ? { replace } : {}),
        ...(locale ? { locale } : {}),
      },
    },
  });
};

export const usePersonaProfileMe = (locale?: string, options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  return useQuery(
    "/api/v1/persona/profile/me",
    enabled ? { params: { query: locale ? { locale } : undefined } } : null
  );
};

export const usePersonaQuestionAnswers = (
  questionId: number,
  options?: { locale?: string; limit?: number; cursor?: number; enabled?: boolean }
) => {
  const enabled = options?.enabled ?? true;
  return useQuery(
    "/api/v1/persona/questions/{questionId}/answers",
    enabled
      ? {
          params: {
            path: { questionId },
            query: {
              ...(options?.locale ? { locale: options.locale } : {}),
              ...(options?.limit != null ? { limit: options.limit } : {}),
              ...(options?.cursor != null ? { cursor: options.cursor } : {}),
            },
          },
        }
      : null
  );
};

export const usePersonaProfileUser = (
  userId: string,
  options?: { exclude?: number; enabled?: boolean; locale?: string }
) => {
  const enabled = options?.enabled ?? true;
  return useQuery(
    "/api/v1/persona/profile/{userId}",
    enabled
      ? {
          params: {
            path: { userId },
            query: {
              ...(options?.exclude != null ? { exclude: options.exclude } : {}),
              ...(options?.locale ? { locale: options.locale } : {}),
            },
          },
        }
      : null
  );
};
