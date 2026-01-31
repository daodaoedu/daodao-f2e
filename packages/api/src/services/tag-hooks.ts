"use client";

/**
 * Tag API Hooks
 * 提供標籤相關的 React Hooks（用於 Client Components）
 */

import { useQuery } from "../hooks";
import type {
  IGetTagSearchParams,
  IGetTagSuggestParams,
  IGetPopularTagsParams,
  IGetTagPromptsParams,
  IGetTagPromptsByTagsParams,
} from "./tag";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 搜尋標籤的 Hook
 */
export const useTagSearch = (params: IGetTagSearchParams) => {
  return useQuery("/api/v1/tags/search", {
    params: {
      query: {
        query: params.query,
        limit: params.limit,
      },
    },
  });
};

/**
 * 取得標籤建議（自動補全）的 Hook
 * @param params - 查詢參數
 */
export const useTagSuggest = (params: IGetTagSuggestParams) => {
  return useQuery("/api/v1/tags/suggest", {
    params: {
      query: {
        q: params.q,
        limit: params.limit,
      },
    },
  });
};

/**
 * 取得熱門標籤的 Hook
 */
export const usePopularTags = (params?: IGetPopularTagsParams) => {
  return useQuery("/api/v1/tags/popular", {
    params: {
      query: {
        limit: params?.limit,
        entityType: params?.entityType,
        timeRange: params?.timeRange,
      },
    },
  });
};

/**
 * 取得引導句列表的 Hook
 */
export const useTagPrompts = (params?: IGetTagPromptsParams) => {
  return useQuery("/api/v1/tag-prompts", {
    params: {
      query: {
        usageType: params?.usageType,
        locale: params?.locale,
      },
    },
  });
};

/**
 * 取得標籤引導句的 Hook（根據標籤名稱）
 */
export const useTagPromptsByTags = (params: IGetTagPromptsByTagsParams) => {
  return useQuery("/api/v1/tags/prompts", {
    params: {
      query: {
        tags: params.tags,
        usageType: params.usageType,
        locale: params.locale,
      },
    },
  });
};
