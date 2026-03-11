/**
 * Reaction API Service
 * 提供快速反應相關的 API 調用函數
 */

import { client } from "../client";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type GetReactionsQuery = NonNullable<paths["/api/v1/reactions"]["get"]["parameters"]["query"]>;

export type ReactionTargetType = GetReactionsQuery["targetType"];

export type ReactionTypeValue = components["schemas"]["UpsertReactionRequest"]["reactionType"];

export type GetReactionsResponse =
  paths["/api/v1/reactions"]["get"]["responses"]["200"]["content"]["application/json"];

export type GetReactionsListResponse =
  paths["/api/v1/reactions/list"]["get"]["responses"]["200"]["content"]["application/json"];

export type ReactionListItem = components["schemas"]["ReactionListItem"];

export type UpsertReactionRequest = components["schemas"]["UpsertReactionRequest"];
export type RemoveReactionRequest = components["schemas"]["RemoveReactionRequest"];

export interface IGetReactionsParams {
  targetType: ReactionTargetType;
  targetId: string;
}

// ============================================================================
// Client Functions
// ============================================================================

/**
 * 取得目標的反應計數
 */
export const getReactions = async (params: IGetReactionsParams) => {
  return client.GET("/api/v1/reactions", {
    params: {
      query: {
        targetType: params.targetType,
        targetId: params.targetId,
      },
    },
  });
};

/**
 * 新增或更換反應
 */
export const upsertReaction = async (data: UpsertReactionRequest) => {
  return client.POST("/api/v1/reactions", { body: data });
};

/**
 * 取消反應
 */
export const removeReaction = async (data: RemoveReactionRequest) => {
  return client.DELETE("/api/v1/reactions", { body: data });
};

/**
 * 取得目標的個別用戶反應列表
 */
export const getReactionsList = async (params: IGetReactionsParams) => {
  return client.GET("/api/v1/reactions/list", {
    params: {
      query: {
        targetType: params.targetType,
        targetId: params.targetId,
      },
    },
  });
};
