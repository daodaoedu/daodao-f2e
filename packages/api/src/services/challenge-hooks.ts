"use client";

/** 共同挑戰 SWR hooks。 */

import { useQuery } from "../hooks";

// ============================================================================
// Query Hooks
// ============================================================================

/** 探索共同挑戰列表（公開；登入時附 isJoined）；60 秒輪詢讓「xx 座島已加入」保持新鮮 */
export const useChallenges = () =>
  useQuery(
    "/api/v1/challenges",
    {},
    { revalidateOnFocus: false, refreshInterval: 60_000 }
  );

/** 挑戰詳情 */
export const useChallenge = (challengeId: number | undefined) =>
  useQuery(
    "/api/v1/challenges/{challengeId}",
    challengeId ? { params: { path: { challengeId } } } : null,
    { revalidateOnFocus: false }
  );

/** 今日抽卡現況（僅參與者） */
export const useTodayDraws = (challengeId: number | undefined, enabled = true) =>
  useQuery(
    "/api/v1/challenges/{challengeId}/draws/today",
    challengeId && enabled ? { params: { path: { challengeId } } } : null,
    { revalidateOnFocus: false }
  );
