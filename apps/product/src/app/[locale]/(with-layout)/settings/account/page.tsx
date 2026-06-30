"use client";

import { useTranslations } from "@daodao/i18n";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { AccountForm } from "@/components/settings/account";

export default function AccountSettingsPage() {
  const t = useTranslations("app_product");

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" leftLabel="" title={t("settings_account")} />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[224px] pt-3 md:pb-[128px] md:pt-12">
        <AccountForm />
      </main>
    </div>
  );
}
