/** Learning timeline API service. */

import { client } from "../client";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

export type TimelineEntryType = components["schemas"]["TimelineEntry"];
export type IGetMyTimelineParams = NonNullable<
  paths["/api/v1/me/timeline"]["get"]["parameters"]["query"]
>;

// ============================================================================
// Client Functions
// ============================================================================

export const getMyTimeline = async (params: IGetMyTimelineParams = {}) =>
  client.GET("/api/v1/me/timeline", {
    params: { query: params },
  });
