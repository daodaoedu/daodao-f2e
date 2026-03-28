"use client";

/**
 * Notification API Hooks
 * 通知相關的 React Hooks（用於 Client Components）
 */

import { useQuery } from "../hooks";

// ============================================================================
// Query Hooks
// ============================================================================

/** 取得 In-App 通知列表，每 30 秒 polling + focus revalidate */
export const useNotifications = (params?: { cursor?: string; limit?: number }) => {
  return useQuery(
    "/api/v1/notifications",
    {
      params: {
        query: {
          cursor: params?.cursor,
          limit: params?.limit,
        },
      },
    },
    {
      refreshInterval: 30 * 1000,
      revalidateOnFocus: true,
    }
  );
};

/** 取得通知偏好設定 */
export const useNotificationPreferences = () => {
  return useQuery("/api/v1/notifications/preferences", {});
};
