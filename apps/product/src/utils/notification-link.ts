import type { NotificationApiItem } from "@/hooks/use-notifications";

/**
 * 使用者頁路徑：有設 customId 用 customId，否則 fallback 到 id（UUID）。
 * `/users/[identifier]` 兩種都能開，UUID 版會再 redirect 到 customId 版。
 */
export function getUserProfilePath(user: {
  id?: string | null;
  customId?: string | null;
}): string | null {
  const identifier = user.customId || user.id;
  return identifier ? `/users/${identifier}` : null;
}

/** 通知點擊後要導向的站內路徑；無對應頁面時回傳 null */
export function buildNotificationDeepLink(item: NotificationApiItem): string | null {
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
    case "connection":
      return getUserProfilePath(item.actor);
    case "buddy_request":
      return extId ? `/practices/${extId}` : null;
    case "persona_answer":
      return item.url ?? null;
    default:
      return null;
  }
}
