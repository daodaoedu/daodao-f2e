"use client";

import { PageHeader } from "@/components/layout";
import { QuarterlyReportPage } from "@/components/quarterly-report";
import { MOCK_REPORT_DATA } from "@/components/quarterly-report/mock-data";

export default function QuarterlyReportRoute() {
  const data = MOCK_REPORT_DATA;

  // 淺灰綠底色與白色卡片做出層次，避免白框白底分不清
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-[#F2F7F6]">
      {/* 完整年季資訊已在內文 H1 呈現，header 保持短標題避免窄螢幕斷行 */}
      <PageHeader leftAction="back" leftLabel="" title="季度報告" />
      <main className="max-w-[640px] mx-auto pb-10">
        <QuarterlyReportPage data={data} />
      </main>
    </div>
  );
}
