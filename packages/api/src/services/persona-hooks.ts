"use client";

/**
 * Persona API Hooks
 * 提供學習人物誌相關的 React Hooks（用於 Client Components）
 */

import { useQuery } from "../hooks";

// ============================================================================
// Query Hooks
// ============================================================================

export const usePersonaQuestions = () => {
  return useQuery("/api/v1/persona/questions", {});
};

export const usePersonaCarouselState = (replace?: number) => {
  return useQuery("/api/v1/persona/carousel-state", {
    params: { query: replace != null ? { replace } : undefined },
  });
};

export const usePersonaProfileMe = () => {
  return useQuery("/api/v1/persona/profile/me", {});
};

export const usePersonaProfileUser = (userId: string, options?: { exclude?: number; enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  return useQuery(
    "/api/v1/persona/profile/{userId}",
    enabled
      ? {
          params: {
            path: { userId },
            query: options?.exclude != null ? { exclude: options.exclude } : undefined,
          },
        }
      : null,
  );
};
