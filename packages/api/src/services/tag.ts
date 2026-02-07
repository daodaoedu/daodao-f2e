/**
 * Tag API Service
 * 提供標籤相關的 API 調用函數（用於 Server Components 或直接調用）
 */

import { client } from "../client";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

export type IGetTagSearchParams = NonNullable<
  paths["/api/v1/tags/search"]["get"]["parameters"]["query"]
>;

export type IGetTagSuggestParams = NonNullable<
  paths["/api/v1/tags/suggest"]["get"]["parameters"]["query"]
>;

export type IGetPopularTagsParams = NonNullable<
  paths["/api/v1/tags/popular"]["get"]["parameters"]["query"]
>;

export type IGetTagPromptsParams = NonNullable<
  paths["/api/v1/tag-prompts"]["get"]["parameters"]["query"]
>;

export type IGetTagPromptsByTagsParams = NonNullable<
  paths["/api/v1/tags/prompts"]["get"]["parameters"]["query"]
>;

// ============================================================================
// Client Functions (用於 Server Components 或直接調用)
// ============================================================================

/**
 * 搜尋標籤
 */
export const searchTags = async (params: IGetTagSearchParams) => {
  return client.GET("/api/v1/tags/search", {
    params: {
      query: {
        query: params.query,
        limit: params.limit,
      },
    },
  });
};

/**
 * 取得標籤建議（自動補全）
 */
export const suggestTags = async (params: IGetTagSuggestParams) => {
  return client.GET("/api/v1/tags/suggest", {
    params: {
      query: {
        q: params.q,
        limit: params.limit,
      },
    },
  });
};

/**
 * 取得熱門標籤
 */
export const getPopularTags = async (params?: IGetPopularTagsParams) => {
  return client.GET("/api/v1/tags/popular", {
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
 * 取得引導句列表
 */
export const getTagPrompts = async (params?: IGetTagPromptsParams) => {
  return client.GET("/api/v1/tag-prompts", {
    params: {
      query: {
        usageType: params?.usageType,
        locale: params?.locale,
      },
    },
  });
};

/**
 * 取得標籤引導句（根據標籤名稱）
 */
export const getTagPromptsByTags = async (params: IGetTagPromptsByTagsParams) => {
  return client.GET("/api/v1/tags/prompts", {
    params: {
      query: {
        tags: params.tags,
        usageType: params.usageType,
        locale: params.locale,
      },
    },
  });
};

// ============================================================================
// Export Types
// ============================================================================

type TagSearchResponse =
  paths["/api/v1/tags/search"]["get"]["responses"]["200"]["content"]["application/json"];

type TagSuggestResponse =
  paths["/api/v1/tags/suggest"]["get"]["responses"]["200"]["content"]["application/json"];

type PopularTagsResponse =
  paths["/api/v1/tags/popular"]["get"]["responses"]["200"]["content"]["application/json"];

type TagPromptsResponse =
  paths["/api/v1/tag-prompts"]["get"]["responses"]["200"]["content"]["application/json"];

type TagPromptsByTagsResponse =
  paths["/api/v1/tags/prompts"]["get"]["responses"]["200"]["content"]["application/json"];

export type {
  TagSearchResponse,
  TagSuggestResponse,
  PopularTagsResponse,
  TagPromptsResponse,
  TagPromptsByTagsResponse,
};
