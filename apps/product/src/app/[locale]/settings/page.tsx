"use client";

import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { SettingsList } from "@/components/settings";

export default function SettingsPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" leftLabel="" title="設定" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[64px] pt-3 md:pt-12">
        <SettingsList />
      </main>
    </div>
  );
}
