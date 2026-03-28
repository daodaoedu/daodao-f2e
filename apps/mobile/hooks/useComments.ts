import useSWR from "swr";
import { api } from "@/services/api-client";

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

// ── Query Hook ──

export function useComments(targetType: string, targetId: string) {
  const { data, error, isLoading, mutate } = useSWR<CommentsResponse>(
    targetId ? `/comments?targetType=${targetType}&targetId=${targetId}` : null,
    (url: string) => api.get<CommentsResponse>(url),
    { revalidateOnFocus: false }
  );

  const comments = data?.data ?? [];

  return { comments, error, isLoading, mutate };
}

// ── Mutations ──

export async function createComment(targetType: string, targetId: string, content: string) {
  return api.post<{ success: boolean; data?: Comment }>("/comments", {
    targetType,
    targetId,
    content,
  });
}

export async function updateComment(commentId: string, content: string) {
  return api.put<{ success: boolean }>(`/comments/${commentId}`, { content });
}

export async function deleteComment(commentId: string) {
  return api.delete<{ success: boolean }>(`/comments/${commentId}`);
}
