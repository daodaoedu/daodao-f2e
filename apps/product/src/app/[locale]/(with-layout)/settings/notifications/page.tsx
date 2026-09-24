"use client";

import { useTranslations } from "@daodao/i18n";
import { PageShell } from "@/components/layout";
import { NotificationSettings } from "@/components/settings/notifications/notification-settings";

export default function NotificationSettingsPage() {
  const t = useTranslations("app_product");

  return (
    <PageShell
      headerProps={{ leftAction: "back", leftLabel: "", title: t("settings_notifications") }}
    >
      <NotificationSettings />
    </PageShell>
  );
}
