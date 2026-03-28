"use client";

import useSWR from "swr";
import type { IGetFollowParams } from "./follow";
import {
  checkFollowStatus,
  followTarget,
  getFollowers,
  getFollowing,
  unfollowTarget,
} from "./follow";

// ============================================================================
// Query Hooks
// ============================================================================

export const useFollowers = (params: IGetFollowParams) => {
  return useSWR(
    params.userId ? ["/api/v1/users/:id/followers", params] : null,
    () => getFollowers(params),
    { revalidateOnFocus: false }
  );
};

export const useFollowing = (params: IGetFollowParams) => {
  return useSWR(
    params.userId ? ["/api/v1/users/:id/following", params] : null,
    () => getFollowing(params),
    { revalidateOnFocus: false }
  );
};

export const useFollowStatus = (targetType: "user" | "practice", targetId: string | undefined) => {
  return useSWR(
    targetId ? ["/api/v1/follows/check", targetType, targetId] : null,
    () => checkFollowStatus(targetType, targetId as string),
    { revalidateOnFocus: false }
  );
};

// ============================================================================
// Mutation Hooks
// ============================================================================

export const useFollowMutations = (userId: string) => {
  const { mutate: mutateFollowing } = useFollowing({ userId });

  const follow = async (targetType: "user" | "practice", targetId: string) => {
    await followTarget({ targetType, targetId });
    await mutateFollowing();
  };

  const unfollow = async (targetType: "user" | "practice", targetId: string) => {
    await unfollowTarget(targetType, targetId);
    await mutateFollowing();
  };

  return { follow, unfollow };
};
