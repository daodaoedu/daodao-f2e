"use client";

import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { AccountForm } from "@/components/settings/account";

export default function AccountSettingsPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" leftLabel="" title="帳號設定" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[128px] pt-3 md:pt-12">
        <AccountForm />
      </main>
    </div>
  );
}
