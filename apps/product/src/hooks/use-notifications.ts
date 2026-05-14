"use client";

/**
 * 通知相關 hooks，re-export 自 @daodao/api 並補充 unread count helper。
 * 後端 mutations 直接使用 @daodao/api 的 service functions。
 */

export {
  acceptBuddyRequest,
  type GetNotificationPreferencesResponse,
  type GetNotificationsResponse,
  getNotificationPreferences,
  ignoreBuddyRequest,
  markAllNotificationsRead,
  markNotificationRead,
  type UpdateNotificationPreferencesRequest,
  updateNotificationPreferences,
  useNotificationPreferences,
  useNotifications,
} from "@daodao/api";

import { respondConnectionRequest } from "@daodao/api";

// Re-export types used by notification-list / notification-item
export type { IGetNotificationsParams } from "@daodao/api";
export { respondConnectionRequest } from "@daodao/api";

import { useNotifications } from "@daodao/api";

// ============================================================================
// Local helper derived from API data
// ============================================================================

/** 從通知列表回應中取出未讀數（供 sidebar badge 使用） */
export function useUnreadNotificationCount(): number {
  const { data } = useNotifications({ limit: 20 });
  return data?.data?.unreadCount ?? 0;
}

// ============================================================================
// Convenience wrappers for connection request actions
// ============================================================================

export const acceptConnectionRequest = (requestId: string | number) =>
  respondConnectionRequest(String(requestId), "accept");

export const ignoreConnectionRequest = (requestId: string | number) =>
  respondConnectionRequest(String(requestId), "reject");

// ============================================================================
// Local types for notification display (不依賴 API schema，純 UI 用)
// ============================================================================

export interface NotificationActorData {
  id: string;
  name: string;
  photoURL?: string;
}

/** 後端 controller 將 payload JSONB 展開後回傳的通知物件 */
export interface NotificationApiItem {
  id: number;
  type: string;
  priority: "P1" | "P2";
  isRead: boolean;
  aggregationCount: number;
  createdAt: string;
  actor: NotificationActorData;
  entityType: string;
  entityId: string;
  // Optional fields spread from JSONB payload by backend
  practiceTitle?: string;
  /** practice_checkin 通知時，entityId 為打卡 ID，practiceId 為所屬實踐 ID */
  practiceId?: string;
  connectMessage?: string;
  content?: string;
  connectionRequestId?: number;
  buddyRequestId?: string;
  reactionType?: string;
  checkinId?: number;
}
