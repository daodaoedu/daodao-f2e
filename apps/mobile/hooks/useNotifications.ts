import useSWR, { mutate as globalMutate } from "swr";
import { api } from "@/services/api-client";

// ============================================================================
// Types
// ============================================================================

export interface INotificationActor {
  id: string;
  name: string;
  photoURL?: string;
}

export interface INotificationApiItem {
  id: number;
  type: string;
  priority: "P1" | "P2";
  isRead: boolean;
  aggregationCount: number;
  createdAt: string;
  actor: INotificationActor;
  entityType: string;
  entityId: string;
  practiceTitle?: string;
  connectMessage?: string;
  content?: string;
  connectionRequestId?: number;
  buddyRequestId?: string;
}

interface INotificationsResponse {
  data: {
    notifications: INotificationApiItem[];
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

  const { data, error, isLoading, mutate } = useSWR<INotificationsResponse>(
    [NOTIFICATIONS_KEY, limit],
    () => api.get<INotificationsResponse>(`/notifications?limit=${limit}`),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    }
  );

  return {
    notifications: (data?.data?.notifications ?? []) as INotificationApiItem[],
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
  return api.post(`/connections/requests/${requestId}/respond`, { action });
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
