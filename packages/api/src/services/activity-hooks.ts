"use client";

/** 探索活動 SWR hooks。 */

import { EMPTY_QUERY_INIT, useQuery } from "../hooks";

// ============================================================================
// Query Hooks
// ============================================================================

/** 探索活動列表（公開；登入時附 isJoined）；60 秒輪詢讓參與人數保持新鮮 */
export const useActivities = (mode?: "sync" | "async" | "physical") =>
  useQuery(
    "/api/v1/activities",
    mode ? { params: { query: { mode } } } : EMPTY_QUERY_INIT,
    {
      revalidateOnFocus: false,
      refreshInterval: 60_000,
    }
  );

/** 活動詳情；cohortId 為 null 時不發請求 */
export const useActivityDetail = (cohortId: number | null) =>
  useQuery(
    "/api/v1/activities/{cohortId}",
    cohortId !== null ? { params: { path: { cohortId } } } : null
  );

/** 發起人快覽；userId 為 null 時不發請求 */
export const useActivityHostPreview = (userId: number | null) =>
  useQuery(
    "/api/v1/activities/hosts/{userId}",
    userId !== null ? { params: { path: { userId } } } : null
  );
