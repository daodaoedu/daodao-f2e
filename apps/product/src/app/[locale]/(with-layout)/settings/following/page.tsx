"use client";

import { useTranslations } from "@daodao/i18n";
import { PageShell } from "@/components/layout";
import { FollowingSettings } from "@/components/settings/following/following-settings";

export default function FollowingSettingsPage() {
  const t = useTranslations("app_product");

  return (
    <PageShell
      headerProps={{ leftAction: "back", leftLabel: "", title: t("settings_following_title") }}
    >
      <FollowingSettings />
    </PageShell>
  );
}
