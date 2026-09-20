"use client";

import { useTranslations } from "@daodao/i18n";
import { PageShell } from "@/components/layout";
import { PublicInfoForm } from "@/components/settings/public-info";

export default function PublicInfoSettingsPage() {
  const t = useTranslations("app_product");

  return (
    <PageShell
      headerProps={{ leftAction: "back", leftLabel: "", title: t("settings_public_info") }}
      mainClassName="pb-[224px] md:pb-[128px]"
    >
      <PublicInfoForm />
    </PageShell>
  );
}
