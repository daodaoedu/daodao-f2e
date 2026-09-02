"use client";

/** 探索活動 SWR hooks。 */

import { EMPTY_QUERY_INIT, useQuery } from "../hooks";

// ============================================================================
// Query Hooks
// ============================================================================

/** 探索活動列表（公開；登入時附 isJoined）；60 秒輪詢讓參與人數保持新鮮 */
export const useActivities = () =>
  useQuery("/api/v1/activities", EMPTY_QUERY_INIT, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  });
