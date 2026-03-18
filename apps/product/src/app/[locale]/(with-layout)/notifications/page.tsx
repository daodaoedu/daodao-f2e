"use client";

import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { NotificationList } from "@/components/notifications/notification-list";

export default function NotificationsPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" leftLabel="" title="" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[64px] pt-3 md:pt-12">
        <NotificationList />
      </main>
    </div>
  );
}
