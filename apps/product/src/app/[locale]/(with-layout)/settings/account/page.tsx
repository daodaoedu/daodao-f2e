"use client";

import { useTranslations } from "@daodao/i18n";
import { PageShell } from "@/components/layout";
import { AccountForm } from "@/components/settings/account";

export default function AccountSettingsPage() {
  const t = useTranslations("app_product");

  return (
    <PageShell
      headerProps={{ leftAction: "back", leftLabel: "", title: t("settings_account") }}
      mainClassName="pb-[224px] md:pb-[128px]"
    >
      <AccountForm />
    </PageShell>
  );
}
