"use client";

import { useTranslations } from "@daodao/i18n";
import { PageShell } from "@/components/layout";
import { InteractionSettings } from "@/components/settings/interaction/interaction-settings";

export default function InteractionSettingsPage() {
  const t = useTranslations("app_product");

  return (
    <PageShell
      headerProps={{ leftAction: "back", leftLabel: "", title: t("settings_interaction") }}
    >
      <InteractionSettings />
    </PageShell>
  );
}
