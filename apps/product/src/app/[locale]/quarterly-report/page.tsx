"use client";

import { PageHeader } from "@/components/layout";
import { QuarterlyReportPage } from "@/components/quarterly-report";
import { MOCK_REPORT_DATA } from "@/components/quarterly-report/mock-data";

export default function QuarterlyReportRoute() {
  const data = MOCK_REPORT_DATA;

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <PageHeader leftAction="back" leftLabel="" title={`${data.quarter.year} Q${data.quarter.quarter} 季度報告`} />
      <main className="max-w-[640px] mx-auto pb-10">
        <QuarterlyReportPage data={data} />
      </main>
    </div>
  );
}
