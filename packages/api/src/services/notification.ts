/**
 * Notification API Service
 * 通知相關的 API 調用函數
 */

import { client } from "../client";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

export type GetNotificationsResponse =
  paths["/api/v1/notifications"]["get"]["responses"]["200"]["content"]["application/json"];

export type GetNotificationPreferencesResponse =
  paths["/api/v1/notifications/preferences"]["get"]["responses"]["200"]["content"]["application/json"];

export type UpdateNotificationPreferencesRequest = NonNullable<
  paths["/api/v1/notifications/preferences"]["put"]["requestBody"]
>["content"]["application/json"];

export type NotificationActionResponse =
  paths["/api/v1/notifications/read-all"]["patch"]["responses"]["200"]["content"]["application/json"];

// ============================================================================
// Query Params
// ============================================================================

export interface IGetNotificationsParams {
  cursor?: string;
  limit?: number;
}

// ============================================================================
// Client Functions
// ============================================================================

/** 取得 In-App 通知列表（cursor 分頁） */
export const getNotifications = async (params?: IGetNotificationsParams) => {
  return client.GET("/api/v1/notifications", {
    params: {
      query: {
        cursor: params?.cursor,
        limit: params?.limit,
      },
    },
  });
};

/** 取得通知偏好設定 */
export const getNotificationPreferences = async () => {
  return client.GET("/api/v1/notifications/preferences", {});
};

/** 更新通知偏好設定（含全局開關） */
export const updateNotificationPreferences = async (body: UpdateNotificationPreferencesRequest) => {
  return client.PUT("/api/v1/notifications/preferences", { body });
};

/** 標記單則通知已讀 */
export const markNotificationRead = async (id: number) => {
  return client.PATCH("/api/v1/notifications/{id}/read", {
    params: { path: { id } },
  });
};

/** 全部標記已讀 */
export const markAllNotificationsRead = async () => {
  return client.PATCH("/api/v1/notifications/read-all", {});
};

/** 接受 Buddy 請求 */
export const acceptBuddyRequest = async (buddyRequestId: number) => {
  return client.PATCH("/api/v1/buddy-requests/{id}", {
    params: { path: { id: buddyRequestId } },
    body: { status: "accepted" },
  });
};

/** 忽略 Buddy 請求 */
export const ignoreBuddyRequest = async (buddyRequestId: number) => {
  return client.PATCH("/api/v1/buddy-requests/{id}", {
    params: { path: { id: buddyRequestId } },
    body: { status: "ignored" },
  });
};
