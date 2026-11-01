"use client";

import { PageShell } from "@/components/layout";
import { NotificationList } from "@/components/notifications/notification-list";

export default function NotificationsPage() {
  return (
    <PageShell
      headerProps={{ leftAction: "back", leftLabel: "", title: "", className: "w-full shrink-0" }}
      className="flex h-dvh min-h-0 flex-col overflow-y-hidden"
      mainClassName="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-6"
    >
      <NotificationList />
    </PageShell>
  );
}
