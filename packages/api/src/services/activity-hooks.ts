"use client";

/** 探索活動 SWR hooks。 */

import { useQuery } from "../hooks";

// ============================================================================
// Query Hooks
// ============================================================================

/** 探索活動列表（公開；登入時附 isJoined）；60 秒輪詢讓參與人數保持新鮮 */
export const useActivities = () =>
  useQuery("/api/v1/activities", {}, { revalidateOnFocus: false, refreshInterval: 60_000 });

/** 活動詳情 */
export const useActivity = (cohortId: number | undefined) =>
  useQuery("/api/v1/activities/{cohortId}", cohortId ? { params: { path: { cohortId } } } : null, {
    revalidateOnFocus: false,
  });
