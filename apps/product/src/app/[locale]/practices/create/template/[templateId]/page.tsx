"use client";

import { ArrowRightOutlineSvg, CompassSvg, Deco4Svg } from "@daodao/assets";
import { useRouter } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { Loader, RefreshCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout";
import {
  DURATION_DAYS_OPTIONS,
  ExecutionDurationCard,
  ExecutionTimingCard,
  FREQUENCY_OPTIONS,
  type ManualPracticeFormValues,
  PracticeOverviewCard,
  ResourceCard,
} from "@/components/practice";

// 模擬數據 - 之後可以從 API 取得
const templateData: Record<string, ManualPracticeFormValues> = {
  "learn-vibe-coding": {
    // Step 1
    name: "學習 Vibe coding",
    actionDescription: "搭配 Gemini,看 30 天線上教學、實際 做一個專案。",
    durationMinutes: 40,

    // Step 2
    startDate: "2026-01-01",
    durationDays: DURATION_DAYS_OPTIONS[1].value,
    frequency: FREQUENCY_OPTIONS[1].value,

    // Step 3
    executionTiming: ["holiday", "commute", "beforeSleep"],
    customTiming: "",

    // Step 4
    tags: ["專案管理", "software", "applications", "產品設計", "AI"],
    resources: [
      {
        id: "1",
        name: "Hahow",
        url: "https://hahow.in/",
      },
      {
        id: "2",
        name: "Hahow",
      },
      {
        id: "3",
        name: "我來試試看這個特別長的資源名稱",
        url: "https://example.com/",
      },
    ],
  },
};

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;
  const defaultTemplate = templateData["learn-vibe-coding"];
  const template = templateData[templateId as keyof typeof templateData] ?? defaultTemplate;
  const [showActions, setShowActions] = useState(false);

  if (!template) {
    return null;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowActions(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    // TODO: 隨機模板數據
  };

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
      <Deco4Svg className="absolute top-0 right-0" width={270} height={484} />

      {/* Top Navigation */}
      <PageHeader leftAction="back" closeTo="/" variant="light" />

      <main className="relative max-w-[600px] mx-auto pb-8">
        {/* Category Label */}
        <div className="px-5 py-4">
          <Badge variant="secondary" size="sm" className="text-xs md:text-sm mb-2">
            主題實踐
          </Badge>
          <div className="flex">
            <div className="flex-1">
              <h1 className="text-2xl leading-normal md:text-4xl font-medium text-white mb-1">
                {template.name}
              </h1>
              <p className="text-sm text-white">{template.actionDescription}</p>
            </div>
            <div className="shrink-0">
              <Button
                variant="white"
                onClick={handleRefresh}
                disabled={!showActions}
                className="group text-sm font-normal h-[35px] transition-opacity duration-500 ease-out"
              >
                {showActions ? (
                  <RefreshCcw className="size-4.5 group-hover:animate-spin-reverse" />
                ) : (
                  <Loader className="size-4.5 animate-spin" />
                )}
                換一個
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-[448px] mx-auto pt-4 px-5 pb-28">
          {/* Course Overview Card */}
          <div className="relative">
            {/* Compass Icon */}
            <div className="absolute -top-14 -right-1 z-10">
              <CompassSvg width={109} height={114} />
            </div>

            <PracticeOverviewCard
              actionDescription={template.actionDescription}
              frequency={template.frequency}
              durationMinutes={template.durationMinutes}
              tags={template.tags}
            />
          </div>

          {/* Execution Timing and Duration Cards */}
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            {/* Execution Timing Card */}
            <ExecutionTimingCard
              executionTiming={template.executionTiming}
              customTiming={template.customTiming}
            />

            {/* Execution Duration Card */}
            <ExecutionDurationCard
              durationDays={template.durationDays}
              startDate={template.startDate}
            />
          </div>

          {/* Recommended Resources Section */}
          {Array.isArray(template.resources) && template.resources.length > 0 && (
            <div>
              <h2 className="text-sm text-center font-medium text-white mt-4 mb-3.5">
                推薦你使用以下資源
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {template.resources?.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={{
                      id: resource.id,
                      name: resource.name,
                      url: resource.url,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <footer
          className={cn(
            "fixed bottom-0 left-0 right-0 flex justify-center p-6 bg-very-light-gray transition-transform duration-500 ease-out border-t border-light-gray",
            showActions ? "translate-y-0" : "translate-y-full"
          )}
        >
          <Button
            onClick={() => {
              // TODO: 處理開始實踐的邏輯（提交到 API）
              // 提交成功後導航到成功頁面
              router.push(
                `/practices/create/success?practiceName=${encodeURIComponent(template.name || "")}`
              );
            }}
            className="w-full sm:max-w-[288px]"
          >
            看起來不錯
            <ArrowRightOutlineSvg className="size-4.5" />
          </Button>
        </footer>
      </main>
    </div>
  );
}
