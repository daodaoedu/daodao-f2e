"use client";

import { PageShell } from "@/components/layout";
import { NotificationList } from "@/components/notifications/notification-list";

export default function NotificationsPage() {
  return (
    <PageShell headerProps={{ leftAction: "back", leftLabel: "", title: "" }}>
      <NotificationList />
    </PageShell>
  );
}
