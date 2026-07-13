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

/**
 * SWR keys use primitives only — never put the whole `params` object in the key
 * (inline `{ userId }` from callers would thrash the cache every render).
 */

export const useFollowers = (params: IGetFollowParams) => {
  const { userId, page, limit } = params;
  return useSWR(
    userId ? (["/api/v1/users/:id/followers", userId, page ?? null, limit ?? null] as const) : null,
    () => getFollowers({ userId, page, limit }),
    { revalidateOnFocus: false }
  );
};

export const useFollowing = (params: IGetFollowParams) => {
  const { userId, page, limit } = params;
  return useSWR(
    userId ? (["/api/v1/users/:id/following", userId, page ?? null, limit ?? null] as const) : null,
    () => getFollowing({ userId, page, limit }),
    { revalidateOnFocus: false }
  );
};

export const useFollowStatus = (targetType: "user" | "practice", targetId: string | undefined) => {
  return useSWR(
    targetId ? (["/api/v1/follows/check", targetType, targetId] as const) : null,
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
