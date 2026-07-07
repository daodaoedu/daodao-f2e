"use client";

import { QuarterlyReportPage } from "@/components/quarterly-report";
import { MOCK_REPORT_DATA } from "@/components/quarterly-report/mock-data";

/** 季報：嵌入既有 quarterly-report 元件（POC 沿用其 mock 資料） */
export function QuarterlyReportView() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-[#8A9BA0]">功能預覽 · 沿用季度報告既有設計</p>
      <div className="-mx-5 rounded-2xl bg-[#F5F7FA]">
        <QuarterlyReportPage data={MOCK_REPORT_DATA} />
      </div>
    </div>
  );
}
