"use client";

import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { ConnectionsSettings } from "@/components/settings/connections/connections-settings";

export default function ConnectionsSettingsPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" leftLabel="" title="連結的夥伴" />
      <BackgroundAnimation />
      <main className="max-w-[448px] mx-auto px-5 pb-[64px] pt-3 md:pt-12">
        <ConnectionsSettings />
      </main>
    </div>
  );
}
