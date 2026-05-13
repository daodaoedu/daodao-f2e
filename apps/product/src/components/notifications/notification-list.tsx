"use client";

import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { useState } from "react";
import { mutate as globalMutate } from "swr";
import { NotificationType } from "@/constants/notification-type";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { REACTION_CONFIG } from "@/constants/reaction-type";
import type { NotificationApiItem } from "@/hooks/use-notifications";
import {
  acceptConnectionRequest,
  ignoreConnectionRequest,
  markAllNotificationsRead,
  markNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/utils/format-time";
import type { INotificationData } from "./notification-item";
import { NotificationItem } from "./notification-item";

// ============================================================================
// Helpers
// ============================================================================

const BACKEND_TYPE_MAP: Record<string, INotificationData["type"]> = {
  UserFollowed: NotificationType.followUser,
  PracticeFollowed: NotificationType.followPractice,
  Connect: NotificationType.connect,
  ConnectAccepted: NotificationType.agreeConnect,
  PracticeCheckinActivity: NotificationType.updatePracticeCheckin,
  PartnerCheckinActivity: NotificationType.updatePracticeCheckin,
  PracticeCreated: NotificationType.practiceCreated,
};

function normalizeNotificationType(backendType: string): INotificationData["type"] {
  return (BACKEND_TYPE_MAP[backendType] ?? backendType) as INotificationData["type"];
}

function getReactionEmoji(reactionType: string | undefined): string | undefined {
  if (!reactionType) return undefined;
  return REACTION_CONFIG[reactionType as ReactionTypeType]?.emoji;
}

function apiItemToDisplay(item: NotificationApiItem): INotificationData {
  return {
    id: String(item.id),
    type: normalizeNotificationType(item.type),
    actor: {
      id: item.actor.id ? String(item.actor.id) : undefined,
      name: item.actor.name,
      photoURL: item.actor.photoURL,
    },
    practice: item.practiceTitle
      ? { id: item.entityId ?? "", name: item.practiceTitle }
      : undefined,
    content: item.content,
    connectMessage: item.connectMessage,
    reaction: getReactionEmoji(item.reactionType),
    aggregationCount: item.aggregationCount,
    connectionRequestId:
      item.connectionRequestId != null ? String(item.connectionRequestId) : undefined,
    buddyRequestId: item.buddyRequestId,
    time: formatRelativeTime(item.createdAt),
    isRead: item.isRead,
  };
}

function buildDeepLink(item: NotificationApiItem): string | null {
  const extId = item.entityId;

  switch (item.entityType) {
    case "comment":
      if (extId && item.checkinId) return `/practices/${extId}/check-ins/${item.checkinId}`;
      return extId ? `/practices/${extId}` : null;
    case "practice":
      if (extId && item.checkinId) return `/practices/${extId}/check-ins/${item.checkinId}`;
      return extId ? `/practices/${extId}` : null;
    case "checkin":
      if (extId && item.checkinId) return `/practices/${extId}/check-ins/${item.checkinId}`;
      return extId ? `/practices/${extId}` : null;
    case "user":
      return item.actor.id ? `/users/${item.actor.id}` : null;
    case "connection":
      return item.actor.id ? `/users/${item.actor.id}` : null;
    case "buddy_request":
      return extId ? `/practices/${extId}` : null;
    default:
      return null;
  }
}

// ============================================================================
// Section Component
// ============================================================================

interface NotificationSectionProps {
  title: string;
  notifications: INotificationData[];
  onConnectAgree: (id: string) => void;
  onConnectReject: (id: string) => void;
  onClick: (notification: INotificationData) => void;
}

function NotificationSection({
  title,
  notifications,
  onConnectAgree,
  onConnectReject,
  onClick,
}: NotificationSectionProps) {
  if (notifications.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <p className="text-sm text-text-dark py-2">{title}</p>
      <div className="flex flex-col gap-1">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onConnectAgree={onConnectAgree}
            onConnectReject={onConnectReject}
            onClick={onClick}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// Main Component
// ============================================================================

// 讓所有 /api/v1/notifications 相關的 SWR cache 都失效（list + bell 不同 key）
const revalidateAllNotifications = () =>
  globalMutate(
    (key: unknown) => Array.isArray(key) && key[1] === "/api/v1/notifications",
    undefined,
    { revalidate: true }
  );

export function NotificationList() {
  const router = useRouter();
  const { data, isLoading } = useNotifications();
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<INotificationData>>>(
    {}
  );

  const rawItems = data?.data?.notifications ?? [];
  const apiItems = (rawItems as unknown as NotificationApiItem[])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const notifications: INotificationData[] = apiItems.map((item) => {
    const base = apiItemToDisplay(item);
    return { ...base, ...(localOverrides[base.id] ?? {}) };
  });

  const handleConnectAgree = async (id: string) => {
    const item = apiItems.find((n) => String(n.id) === id);
    const connectionRequestId = item?.connectionRequestId;

    setLocalOverrides((prev) => ({
      ...prev,
      [id]: { type: NotificationType.connectAgree },
    }));

    try {
      if (connectionRequestId) {
        await acceptConnectionRequest(connectionRequestId);
      }
      const n = notifications.find((n) => n.id === id);
      if (n) {
        toast.success(`你同意了 ${n.actor.name} 的連結請求，你們現在可以有更多互動了！`);
      }
      revalidateAllNotifications();
    } catch (err) {
      setLocalOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.error(err instanceof Error ? err.message : "操作失敗，請稍後再試");
    }
  };

  const handleConnectReject = async (id: string) => {
    const item = apiItems.find((n) => String(n.id) === id);
    const connectionRequestId = item?.connectionRequestId;
    const n = notifications.find((n) => n.id === id);

    setLocalOverrides((prev) => ({
      ...prev,
      [id]: { type: NotificationType.connectRejected },
    }));

    try {
      if (connectionRequestId) {
        await ignoreConnectionRequest(connectionRequestId);
      }
      toast.success(`已忽略 ${n?.actor.name ?? ""} 的連結請求`);
      revalidateAllNotifications();
    } catch (err) {
      setLocalOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.error(err instanceof Error ? err.message : "操作失敗，請稍後再試");
    }
  };

  const handleClick = async (notification: INotificationData) => {
    // mark as read
    if (!notification.isRead) {
      setLocalOverrides((prev) => ({
        ...prev,
        [notification.id]: { isRead: true },
      }));
      await markNotificationRead(Number(notification.id)).catch(() => {});
      await revalidateAllNotifications();
    }

    // navigate
    const apiItem = apiItems.find((n) => String(n.id) === notification.id);
    if (apiItem) {
      const link = buildDeepLink(apiItem);
      if (link) router.push(link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(() => {});
    // 同時讓 list 和 bell 的 SWR cache 都失效（兩者用不同 params，key 不同）
    await revalidateAllNotifications();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1">
        {[...Array(5)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <div key={i} className="bg-white rounded h-[76px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-dark/50">
        <p className="text-base">目前沒有通知</p>
      </div>
    );
  }

  const latest = notifications.filter((n) => !n.isRead);
  const earlier = notifications.filter((n) => n.isRead);
  const hasUnread = latest.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {hasUnread && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-text-dark/60 hover:text-text-dark"
            onClick={handleMarkAllRead}
          >
            全部標為已讀
          </Button>
        </div>
      )}

      <NotificationSection
        title="最新"
        notifications={latest}
        onConnectAgree={handleConnectAgree}
        onConnectReject={handleConnectReject}
        onClick={handleClick}
      />
      <NotificationSection
        title="稍早"
        notifications={earlier}
        onConnectAgree={handleConnectAgree}
        onConnectReject={handleConnectReject}
        onClick={handleClick}
      />
    </div>
  );
}
