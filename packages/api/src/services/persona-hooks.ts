"use client";

/**
 * Persona API Hooks
 * 提供學習人物誌相關的 React Hooks（用於 Client Components）
 */

import { useMemo } from "react";
import { useQuery } from "../hooks";

type PersonaLocale = "zh-TW" | "en";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 注意：init 必須 useMemo 穩定。
 * swr-openapi 的 cache key 是 [prefix, path, init]，用 reference 比較；
 * 每次 render 新建 init 會導致 key 一直變 → 無限 revalidate → isLoading 卡住 → UI 永遠空白。
 */

export const usePersonaQuestions = (locale?: string, options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const init = useMemo(
    () => (enabled ? { params: { query: locale ? { locale } : undefined } } : null),
    [enabled, locale]
  );
  return useQuery("/api/v1/persona/questions", init);
};

export const usePersonaCarouselState = (
  replace?: number,
  locale?: string,
  options?: { enabled?: boolean }
) => {
  const enabled = options?.enabled ?? true;
  const init = useMemo(
    () =>
      enabled
        ? {
            params: {
              query: {
                ...(replace != null ? { replace } : {}),
                ...(locale ? { locale: locale as PersonaLocale } : {}),
              },
            },
          }
        : null,
    [enabled, replace, locale]
  );
  return useQuery("/api/v1/persona/carousel-state", init);
};

export const usePersonaProfileMe = (locale?: string, options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const init = useMemo(
    () => (enabled ? { params: { query: locale ? { locale } : undefined } } : null),
    [enabled, locale]
  );
  return useQuery("/api/v1/persona/profile/me", init);
};

export const usePersonaQuestionAnswers = (
  questionId: number,
  options?: { locale?: string; limit?: number; cursor?: number; enabled?: boolean }
) => {
  const enabled = options?.enabled ?? true;
  const locale = options?.locale;
  const limit = options?.limit;
  const cursor = options?.cursor;
  const init = useMemo(
    () =>
      enabled
        ? {
            params: {
              path: { questionId },
              query: {
                ...(locale ? { locale: locale as PersonaLocale } : {}),
                ...(limit != null ? { limit } : {}),
                ...(cursor != null ? { cursor } : {}),
              },
            },
          }
        : null,
    [enabled, questionId, locale, limit, cursor]
  );
  return useQuery("/api/v1/persona/questions/{questionId}/answers", init);
};

export const usePersonaProfileUser = (
  userId: string,
  options?: { exclude?: number; enabled?: boolean; locale?: string }
) => {
  const enabled = options?.enabled ?? true;
  const exclude = options?.exclude;
  const locale = options?.locale;
  const init = useMemo(
    () =>
      enabled
        ? {
            params: {
              path: { userId },
              query: {
                ...(exclude != null ? { exclude } : {}),
                ...(locale ? { locale: locale as PersonaLocale } : {}),
              },
            },
          }
        : null,
    [enabled, userId, exclude, locale]
  );
  return useQuery("/api/v1/persona/profile/{userId}", init);
};
