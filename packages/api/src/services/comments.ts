/**
 * Comments API Service
 * 提供留言相關的 API 調用函數（用於 Server Components 或直接調用）
 */

import { client } from "../client";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type CommentListResponse =
  paths["/api/v1/comments"]["get"]["responses"]["200"]["content"]["application/json"];

type CommentDetailResponse =
  paths["/api/v1/comments/{commentId}"]["get"]["responses"]["200"]["content"]["application/json"];

export type IGetCommentsQuery = NonNullable<
  paths["/api/v1/comments"]["get"]["parameters"]["query"]
>;

export type CommentTargetType = IGetCommentsQuery["targetType"];

export interface IGetCommentsParams {
  targetType: CommentTargetType;
  targetId: string;
}

export interface ICreateCommentRequestType
  extends Omit<components["schemas"]["CreateCommentRequest"], "targetType"> {
  targetType: CommentTargetType;
}

export type IUpdateCommentRequestType = components["schemas"]["UpdateCommentRequest"];

export type { CommentListResponse, CommentDetailResponse };

// ============================================================================
// Client Functions (用於 Server Components 或直接調用)
// ============================================================================

/**
 * 取得留言列表
 */
export const getComments = async (params: IGetCommentsParams) => {
  return client.GET("/api/v1/comments", {
    params: {
      query: {
        targetType: params.targetType,
        targetId: params.targetId,
      },
    },
  });
};

/**
 * 建立留言
 */
export const createComment = async (data: ICreateCommentRequestType) => {
  return client.POST("/api/v1/comments", {
    body: {
      ...data,
    },
  });
};

/**
 * 更新留言
 */
export const updateComment = async (commentId: number, data: IUpdateCommentRequestType) => {
  return client.PUT("/api/v1/comments/{commentId}", {
    params: {
      path: {
        commentId,
      },
    },
    body: data,
  });
};

/**
 * 刪除留言
 */
export const deleteComment = async (commentId: number) => {
  return client.DELETE("/api/v1/comments/{commentId}", {
    params: {
      path: {
        commentId,
      },
    },
  });
};
