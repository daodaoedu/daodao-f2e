/** 探索活動 API service（openspec: challenge-activity-space-wiring / activity-discovery）。 */

import { client } from "../client";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type ActivityListResponse =
  paths["/api/v1/activities"]["get"]["responses"][200]["content"]["application/json"];
export type ActivitySummaryType = ActivityListResponse["data"][number];
export type ActivityRunStatusType = ActivitySummaryType["runStatus"];

// ============================================================================
// Client Functions
// ============================================================================

/** 探索活動列表（公開；只含組織公開、已發佈且未結束的期；登入時附 isJoined） */
export const getActivities = async () => client.GET("/api/v1/activities");
