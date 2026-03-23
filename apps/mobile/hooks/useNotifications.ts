import { useCallback } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { api } from "@/services/api-client";

// ============================================================================
// Types
// ============================================================================

export interface NotificationActor {
  id: string;
  name: string;
  photoURL?: string;
}

export interface NotificationApiItem {
  id: number;
  type: string;
  priority: "P1" | "P2";
  isRead: boolean;
  aggregationCount: number;
  createdAt: string;
  actor: NotificationActor;
  entityType: string;
  entityId: string;
  practiceTitle?: string;
  connectMessage?: string;
  content?: string;
  connectionRequestId?: number;
  buddyRequestId?: string;
}

interface NotificationsResponse {
  data: {
    notifications: NotificationApiItem[];
    unreadCount: number;
    nextCursor?: string;
  };
}

// ============================================================================
// Hook
// ============================================================================

const NOTIFICATIONS_KEY = "/notifications";

export function useNotifications(params?: { limit?: number }) {
  const limit = params?.limit ?? 50;

  const { data, error, isLoading, mutate } = useSWR<NotificationsResponse>(
    [NOTIFICATIONS_KEY, limit],
    () => api.get<NotificationsResponse>(`/notifications?limit=${limit}`),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    }
  );

  return {
    notifications: (data?.data?.notifications ?? []) as NotificationApiItem[],
    unreadCount: data?.data?.unreadCount ?? 0,
    isLoading,
    error,
    mutate,
  };
}

// ============================================================================
// Mutations
// ============================================================================

export async function markNotificationRead(id: number) {
  return api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  return api.patch("/notifications/read-all");
}

export async function respondConnectionRequest(requestId: string, action: "accept" | "reject") {
  return api.patch(`/connections/${requestId}`, { action });
}

// ============================================================================
// Revalidation helper
// ============================================================================

export function revalidateAllNotifications() {
  return globalMutate(
    (key: unknown) => Array.isArray(key) && key[0] === NOTIFICATIONS_KEY,
    undefined,
    { revalidate: true }
  );
}
