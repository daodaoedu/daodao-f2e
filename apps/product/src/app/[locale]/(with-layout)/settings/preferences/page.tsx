"use client";

import { useTranslations } from "@daodao/i18n";
import { PageShell } from "@/components/layout";
import { PreferencesForm } from "@/components/settings/preferences";

export default function PreferencesSettingsPage() {
  const t = useTranslations("app_product");

  return (
    <PageShell
      headerProps={{ leftAction: "back", leftLabel: "", title: t("settings_preferences") }}
      mainClassName="pb-[224px] md:pb-[128px]"
    >
      <PreferencesForm />
    </PageShell>
  );
}
