"use client";

import { TeacherDashboardPage } from "@/components/companion";
import { PageHeader } from "@/components/layout";

export default function CompanionDashboardRoute() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-[#F2F7F6]">
      <PageHeader leftAction="back" leftLabel="" title="陪伴計畫" />
      <main className="max-w-[640px] mx-auto pb-10">
        <TeacherDashboardPage />
      </main>
    </div>
  );
}
