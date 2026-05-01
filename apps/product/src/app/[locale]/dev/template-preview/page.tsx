"use client";

// ============================================================================
// Dev Preview — 實踐 Template 詳情頁 markup（mock 資料，不需登入）
// 對應正式路由：/practices/create/template/[templateId]
// ============================================================================

import { ArrowRightOutlineSvg, CompassSvg, Deco4Svg } from "@daodao/assets";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { RefreshCcw } from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  ExecutionDurationCard,
  ExecutionTimingCard,
  PracticeOverviewCard,
} from "@/components/practice";
import { DurationDays, ExecutionTiming, Frequency } from "@/constants/practice-form";

// ── Mock Data ────────────────────────────────────────────────────────────────

const mockTemplate = {
  name: "多益 860 分衝刺計畫",
  actionDescription: "每天聽寫一篇 TED Talk，週末做一回模擬考題，逐步提升聽力與閱讀能力。",
  durationMinutes: 45,
  startDate: "2026-04-19",
  durationDays: DurationDays.thirty,
  frequency: Frequency.threeToFive,
  executionTiming: [ExecutionTiming.morning, ExecutionTiming.evening],
  customTiming: "",
  tags: ["英文", "檢定", "聽力", "閱讀"],
  resources: [],
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatePreviewPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
      <Deco4Svg className="absolute top-0 right-0" width={270} height={484} />

      {/* Top Navigation */}
      <PageHeader leftAction="back" leftLabel="" rightActionTo="/" variant="light" />

      <main className="relative max-w-[600px] mx-auto pb-8">
        {/* Category Label + Title */}
        <div className="py-4">
          <div className="max-w-[448px] mx-auto px-5">
            <Badge variant="secondary" size="sm" className="text-xs md:text-sm mb-2">
              主題實踐
            </Badge>
            <div className="flex md:flex-col md:gap-3">
              <div className="flex flex-1 items-start gap-1">
                <div className="flex-1">
                  <h1 className="text-2xl leading-normal md:text-4xl font-medium text-white mb-1">
                    {mockTemplate.name}
                  </h1>
                  <p className="text-sm text-white">{mockTemplate.actionDescription}</p>
                </div>
                {/* Mobile：右側 */}
                <div className="shrink-0 md:hidden">
                  <Button variant="white" className="group text-sm font-normal h-[35px] px-3">
                    <RefreshCcw className="size-4.5 group-hover:animate-spin-reverse" />
                    換一個
                  </Button>
                </div>
              </div>
              {/* Desktop：副標題の下 */}
              <div className="hidden md:block">
                <Button variant="white" className="group text-sm font-normal h-[35px] px-3">
                  <RefreshCcw className="size-4.5 group-hover:animate-spin-reverse" />
                  換一個
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[448px] mx-auto pt-4 px-5 pb-28">
          {/* Practice Overview Card */}
          <div className="relative mb-3.5">
            <div className="absolute -top-14 -right-1 z-10">
              <CompassSvg width={109} height={114} />
            </div>
            <PracticeOverviewCard
              actionDescription={mockTemplate.actionDescription}
              frequency={mockTemplate.frequency}
              durationMinutes={mockTemplate.durationMinutes}
              tags={mockTemplate.tags}
            />
          </div>

          {/* Execution Timing + Duration */}
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            <ExecutionTimingCard
              executionTiming={mockTemplate.executionTiming}
              customTiming={mockTemplate.customTiming}
            />
            <ExecutionDurationCard
              durationDays={mockTemplate.durationDays}
              startDate={mockTemplate.startDate}
            />
          </div>
        </div>

        {/* Action Button */}
        <footer className="fixed bottom-0 left-0 right-0 flex justify-center p-6 bg-very-light-gray border-t border-light-gray">
          <Button variant="orange" className="w-full sm:max-w-[288px]">
            看起來不錯
            <ArrowRightOutlineSvg className="size-4.5" />
          </Button>
        </footer>
      </main>
    </div>
  );
}
