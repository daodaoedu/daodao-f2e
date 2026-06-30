import {
  followTarget as apiFollowTarget,
  unfollowTarget as apiUnfollowTarget,
  useFollowStatus as useApiFollowStatus,
} from "@daodao/api";

// ── Types ──

type FollowTargetType = "user" | "practice";

// ── Query Hook ──

export function useFollowStatus(targetType: string, targetId: string) {
  const { data, error, isLoading, mutate } = useApiFollowStatus(
    targetType as FollowTargetType,
    targetId
  );

  const isFollowing = data?.data?.isFollowing ?? false;

  return { isFollowing, error, isLoading, mutate };
}

// ── Mutations ──

export async function followTarget(targetType: string, targetId: string) {
  return apiFollowTarget({ targetType: targetType as FollowTargetType, targetId });
}

export async function unfollowTarget(targetType: string, targetId: string) {
  return apiUnfollowTarget(targetType as FollowTargetType, targetId);
}
