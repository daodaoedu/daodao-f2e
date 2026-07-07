"use client";

import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { BugReportForm } from "@/components/bug-report/bug-report-form";

export default function BugReportPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction="back" leftLabel="" title="錯誤回報" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[128px] pt-3 md:pt-12">
        <BugReportForm />
      </main>
    </div>
  );
}
