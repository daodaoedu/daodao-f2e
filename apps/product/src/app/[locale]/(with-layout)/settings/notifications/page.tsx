"use client";

import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { NotificationSettings } from "@/components/settings/notifications/notification-settings";

export default function NotificationSettingsPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" leftLabel="" title="通知設定" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[64px] pt-3 md:pt-12">
        <NotificationSettings />
      </main>
    </div>
  );
}
