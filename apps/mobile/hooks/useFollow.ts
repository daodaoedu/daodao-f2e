import useSWR from "swr";
import { api } from "@/services/api-client";

// ── Types ──

interface FollowStatusResponse {
  success: boolean;
  data?: {
    isFollowing: boolean;
  };
}

// ── Query Hook ──

export function useFollowStatus(targetType: string, targetId: string) {
  const { data, error, isLoading, mutate } = useSWR<FollowStatusResponse>(
    targetId ? `/follows/check/${targetType}/${targetId}` : null,
    (url: string) => api.get<FollowStatusResponse>(url),
    { revalidateOnFocus: false }
  );

  const isFollowing = data?.data?.isFollowing ?? false;

  return { isFollowing, error, isLoading, mutate };
}

// ── Mutations ──

export async function followTarget(targetType: string, targetId: string) {
  return api.post("/follows", { targetType, targetId });
}

export async function unfollowTarget(targetType: string, targetId: string) {
  return api.delete(`/follows/${targetType}/${targetId}`);
}
