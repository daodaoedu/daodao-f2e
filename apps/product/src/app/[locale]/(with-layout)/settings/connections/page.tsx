"use client";

import { useTranslations } from "@daodao/i18n";
import { PageShell } from "@/components/layout";
import { ConnectionsSettings } from "@/components/settings/connections/connections-settings";

export default function ConnectionsSettingsPage() {
  const t = useTranslations("app_product");

  return (
    <PageShell
      headerProps={{ leftAction: "back", leftLabel: "", title: t("settings_connections") }}
    >
      <ConnectionsSettings />
    </PageShell>
  );
}
