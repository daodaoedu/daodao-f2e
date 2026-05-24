/**
 * Notification types that represent activity fan-outs to followers —
 * the current user is not the target of these actions, so they should
 * not appear in the notification inbox.
 */
const ACTIVITY_NOTIFICATION_TYPES = [
  "ConnectRequestActivity", // someone you follow sent a connection request to a third party
  "UserFollowActivity", // someone you follow started following a third party
] as const;

export function isActivityNotification(type: string): boolean {
  return (ACTIVITY_NOTIFICATION_TYPES as readonly string[]).includes(type);
}

export function filterActivityNotifications<T extends { type: string }>(items: T[]): T[] {
  return items.filter((item) => !isActivityNotification(item.type));
}
