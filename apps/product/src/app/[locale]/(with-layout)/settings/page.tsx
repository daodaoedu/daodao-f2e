"use client";

import { PageShell } from "@/components/layout";
import { SettingsList, SettingsUserCard } from "@/components/settings";

export default function SettingsPage() {
  return (
    <PageShell headerProps={{ leftAction: "back", leftLabel: "", title: "" }}>
      <SettingsUserCard />
      <SettingsList />
    </PageShell>
  );
}
