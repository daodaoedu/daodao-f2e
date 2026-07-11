import {
  createComment as apiCreateComment,
  deleteComment as apiDeleteComment,
  getComments as apiGetComments,
  updateComment as apiUpdateComment,
  type CommentTargetType,
} from "@daodao/api";
import useSWR from "swr";
import { applyOnboardingUpdateFromResponse } from "@/hooks/useOnboardingProgress";

// ── Types ──

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    photoURL?: string | null;
  };
}

interface CommentsResponse {
  success: boolean;
  data?: Comment[];
}

type ApiComment = NonNullable<Awaited<ReturnType<typeof apiGetComments>>["data"]>["data"][number];

function toMobileComment(comment: ApiComment): Comment {
  return {
    id: String(comment.id),
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    user: comment.user
      ? {
          id: comment.user.id,
          name: comment.user.name,
          photoURL: comment.user.photoURL,
        }
      : undefined,
  };
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return "Request failed";
}

function parseCommentId(commentId: string): number {
  const numericCommentId = Number(commentId);

  if (!Number.isInteger(numericCommentId)) {
    throw new Error("Invalid comment id");
  }

  return numericCommentId;
}

// ── Query Hook ──

export function useComments(targetType: string, targetId: string) {
  const { data, error, isLoading, mutate } = useSWR<CommentsResponse>(
    targetId ? ["/api/v1/comments", targetType, targetId] : null,
    async () => {
      const response = await apiGetComments({
        targetType: targetType as CommentTargetType,
        targetId,
      });

      if (response.error) {
        throw new Error(getErrorMessage(response.error));
      }

      return {
        ...response.data,
        data: response.data.data.map(toMobileComment),
      };
    },
    { revalidateOnFocus: false }
  );

  const comments = data?.data ?? [];

  return { comments, error, isLoading, mutate };
}

// ── Mutations ──

export async function createComment(targetType: string, targetId: string, content: string) {
  const response = await apiCreateComment({
    targetType,
    targetId,
    content,
    visibility: "public",
  } as Parameters<typeof apiCreateComment>[0]);

  if (response.error) {
    throw new Error(getErrorMessage(response.error));
  }

  // 新手任務 E：即時標記「在靈感頁留言」完成（非靈感頁留言時 server 不回 meta，為 no-op）
  applyOnboardingUpdateFromResponse(response.data);

  return {
    ...response.data,
    data: toMobileComment(response.data.data),
  };
}

export async function updateComment(commentId: string, content: string) {
  const response = await apiUpdateComment(parseCommentId(commentId), { content });

  if (response.error) {
    throw new Error(getErrorMessage(response.error));
  }

  return { success: response.data.success };
}

export async function deleteComment(commentId: string) {
  const response = await apiDeleteComment(parseCommentId(commentId));

  if (response.error) {
    throw new Error(getErrorMessage(response.error));
  }

  return { success: response.data.success };
}
