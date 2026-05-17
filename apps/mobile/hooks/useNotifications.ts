import {
  markAllNotificationsRead as apiMarkAllNotificationsRead,
  markNotificationRead as apiMarkNotificationRead,
  respondConnectionRequest as apiRespondConnectionRequest,
  getNotifications,
} from "@daodao/api";
import useSWR, { mutate as globalMutate } from "swr";

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
  practiceId?: string;
  checkinId?: number;
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

type ApiNotificationItem = Record<string, unknown> & {
  id: number;
  type: string;
  priority: string;
  actor?: Record<string, unknown> | null;
};

// ============================================================================
// Hook
// ============================================================================

const NOTIFICATIONS_KEY = "/notifications";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return "Request failed";
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function getOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function getBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function toNotificationActor(actor: ApiNotificationItem["actor"]): INotificationActor {
  if (!actor) {
    return { id: "", name: "有人" };
  }

  return {
    id: String(actor.id ?? ""),
    name: getString(actor.name ?? actor.nickname, "有人"),
    photoURL: getOptionalString(actor.photoURL ?? actor.photoUrl),
  };
}

function toMobileNotification(item: ApiNotificationItem): INotificationApiItem {
  return {
    id: item.id,
    type: item.type,
    priority: item.priority as INotificationApiItem["priority"],
    isRead: getBoolean(item.isRead ?? item.is_read),
    aggregationCount: getNumber(item.aggregationCount ?? item.aggregation_count, 1),
    createdAt: getString(item.createdAt ?? item.created_at),
    actor: toNotificationActor(item.actor),
    entityType: getString(item.entityType ?? item.entity_type),
    entityId: getString(item.entityId ?? item.entity_id),
    practiceId: getOptionalString(item.practiceId ?? item.practice_id),
    checkinId: getOptionalNumber(
      item.checkinId ?? item.checkin_id ?? item.checkInId ?? item.check_in_id
    ),
    practiceTitle: getOptionalString(item.practiceTitle),
    connectMessage: getOptionalString(item.connectMessage),
    content: getOptionalString(item.content),
    connectionRequestId:
      typeof item.connectionRequestId === "number" ? item.connectionRequestId : undefined,
    buddyRequestId: getOptionalString(item.buddyRequestId),
  };
}

export function useNotifications(params?: { limit?: number }) {
  const limit = params?.limit ?? 50;

  const { data, error, isLoading, mutate } = useSWR<INotificationsResponse>(
    [NOTIFICATIONS_KEY, limit],
    async () => {
      const response = await getNotifications({ limit });

      if (response.error) {
        throw new Error(getErrorMessage(response.error));
      }

      return {
        ...response.data,
        data: {
          ...response.data.data,
          nextCursor: response.data.data?.nextCursor ?? undefined,
          notifications: ((response.data.data?.notifications ?? []) as ApiNotificationItem[]).map(
            toMobileNotification
          ),
        },
      };
    },
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
  const response = await apiMarkNotificationRead(id);

  if (response.error) {
    throw new Error(getErrorMessage(response.error));
  }

  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await apiMarkAllNotificationsRead();

  if (response.error) {
    throw new Error(getErrorMessage(response.error));
  }

  return response.data;
}

export async function respondConnectionRequest(requestId: string, action: "accept" | "reject") {
  return apiRespondConnectionRequest(requestId, action);
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
