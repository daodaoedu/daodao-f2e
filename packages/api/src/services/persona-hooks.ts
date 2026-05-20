"use client";

/**
 * Persona API Hooks
 * 提供學習人物誌相關的 React Hooks（用於 Client Components）
 */

import { useQuery } from "../hooks";

// ============================================================================
// Query Hooks
// ============================================================================

export const usePersonaQuestions = (locale?: string) => {
  return useQuery("/api/v1/persona/questions", {
    params: { query: locale ? { locale } : undefined },
  });
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

export const usePersonaProfileMe = (locale?: string) => {
  return useQuery("/api/v1/persona/profile/me", {
    params: { query: locale ? { locale } : undefined },
  });
};

export const usePersonaProfileUser = (userId: string, options?: { exclude?: number; enabled?: boolean; locale?: string }) => {
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
      : null,
  );
};
