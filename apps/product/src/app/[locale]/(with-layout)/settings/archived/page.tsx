"use client";

import { useTranslations } from "@daodao/i18n";
import { PageShell } from "@/components/layout";
import { ArchivedContentList } from "@/components/settings/archived-content-list";

export default function ArchivedContentPage() {
  const t = useTranslations("app_product");

  return (
    <PageShell headerProps={{ leftAction: "back", leftLabel: "", title: t("settings_archived") }}>
      <ArchivedContentList />
    </PageShell>
  );
}
