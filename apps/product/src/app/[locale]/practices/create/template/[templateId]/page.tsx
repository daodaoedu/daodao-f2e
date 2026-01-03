"use client";

import {
  ArrowLeftOutlineSvg,
  ArrowRightOutlineSvg,
  BookSvg,
  BulbSvg,
  ClockSolidSvg,
  CompassSvg,
  Deco4Svg,
  IslandSvg,
  TagSolidSvg,
} from "@daodao/assets";
import { Button } from "@daodao/ui/components/button";
import { Badge } from "@daodao/ui/components/badge";
import { X, RefreshCcw, Link2Icon } from "lucide-react";
import { useRouter } from "@daodao/i18n/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@daodao/ui/lib/utils";

// 模擬數據 - 之後可以從 API 取得
const templateData = {
  "learn-vibe-coding": {
    category: "主題實踐",
    title: "學習 Vibe coding",
    description: "架設自己的網站,可以展示自己的作品,與AI時代接軌!",
    overview: {
      text: "搭配 Gemini,看 30 天線上教學、實際 做一個專案。",
      weeklyLabel: "一週",
      weeklyValue: "3-5",
      weeklyUnit: "天",
      durationLabel: "一次",
      durationValue: "30",
      durationUnit: "分鐘",
      executionDaysValue: "14",
      executionDaysUnit: "天",
      executionDaysLabel: "執行時長",
      topics: ["專案管理", "software", "applications", "產品設計", "AI"],
    },
    executionTiming: {
      options: ["休假日", "例假日", "睡前"],
    },
    executionDuration: {
      daysValue: 14,
      daysUnit: "天",
      startDate: "2026/01/01",
      endDate: "2026/01/14",
    },
    resources: [
      {
        id: 1,
        name: "Hahow",
        thumbnail: "/placeholder-resource.jpg",
      },
      {
        id: 2,
        name: "Hahow",
        thumbnail: "/placeholder-resource.jpg",
      },
      {
        id: 3,
        name: "Hahow",
        thumbnail: "/placeholder-resource.jpg",
      },
    ],
  },
};

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;
  const template =
    templateData[templateId as keyof typeof templateData] ??
    templateData["learn-vibe-coding"];
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFooter(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    // TODO: 隨機模板數據
  };

  return (
    <div className="fixed inset-0 z-30 overflow-hidden overflow-y-auto bg-logo-cyan">
      <Deco4Svg className="absolute top-0 right-0" width={270} height={484} />

      {/* Top Navigation */}
      <div className="max-w-[600px] mx-auto flex items-center justify-between px-5 py-4 md:pt-16">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          animation="none"
          className="text-white px-0 hover:text-white"
        >
          <ArrowLeftOutlineSvg className="size-6" />
          返回
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.replace("/")}
          aria-label="關閉"
          animation="none"
          className="text-white hover:text-white bg-very-light-gray/50"
        >
          <X className="size-5" />
        </Button>
      </div>

      <main className="relative max-w-[600px] mx-auto pb-8">
        {/* Category Label */}
        <div className="px-5 py-4">
          <Badge
            variant="secondary"
            size="sm"
            className="text-xs md:text-sm mb-2"
          >
            {template.category}
          </Badge>
          <div className="flex">
            <div className="flex-1">
              <h1 className="text-2xl leading-normal md:text-4xl font-medium text-white mb-1">
                {template.title}
              </h1>
              <p className="text-sm text-white">{template.description}</p>
            </div>
            <div className="shrink-0">
              <Button
                variant="white"
                onClick={handleRefresh}
                className="text-sm font-normal h-[35px]"
              >
                <RefreshCcw className="size-4.5" />
                換一個
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-[448px] mx-auto pt-4 px-5 pb-28">
          {/* Course Overview Card */}
          <div className="relative bg-white rounded-lg p-4 mb-4 shadow-sm">
            {/* Compass Icon */}
            <div className="absolute -top-14 -right-1">
              <CompassSvg width={109} height={114} />
            </div>

            {/* Overview Text */}
            <p className="font-medium text-text-dark mb-3 pr-[88px]">
              {template.overview.text}
            </p>

            {/* Time Commitments */}
            <div className="grid grid-cols-3 pb-3 mb-3 border-b border-bg-gray">
              <div>
                <div className="text-xs text-text-dark">
                  {template.overview.weeklyLabel}
                </div>
                <div className="flex items-baseline gap-0.5">
                  <div className="text-lg font-medium text-logo-cyan">
                    {template.overview.weeklyValue}
                  </div>
                  <div className="text-xs text-text-dark">
                    {template.overview.weeklyUnit}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-text-dark">
                  {template.overview.durationLabel}
                </div>
                <div className="flex items-baseline gap-0.5">
                  <div className="text-lg font-medium text-logo-cyan">
                    {template.overview.durationValue}
                  </div>
                  <div className="text-xs text-text-dark">
                    {template.overview.durationUnit}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-text-dark">
                  {template.overview.executionDaysLabel}
                </div>
                <div className="flex items-baseline gap-0.5">
                  <div className="text-lg font-medium text-logo-cyan">
                    {template.overview.executionDaysValue}
                  </div>
                  <div className="text-xs text-text-dark">
                    {template.overview.executionDaysUnit}
                  </div>
                </div>
              </div>
            </div>

            {/* Related Topics */}
            <div className="flex flex-wrap gap-2">
              {template.overview.topics.map((topic) => (
                <Badge
                  key={topic}
                  variant="very-light-blue"
                  size="sm"
                  className="text-sm py-[3px] rounded gap-1"
                >
                  <TagSolidSvg
                    width={18}
                    height={18}
                    className="text-light-cyan"
                  />
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* Execution Timing and Duration Cards */}
          <div className="grid grid-cols-2 gap-4 mb-3.5">
            {/* Execution Timing Card */}
            <div className="relative bg-light-cyan rounded-lg px-4 pt-8 pb-3 md:pb-12">
              {/* Lightbulb Icon */}
              <div className="absolute top-0 left-2.5 -translate-y-1/2">
                <BulbSvg width={42} height={53} />
              </div>

              {/* Book Illustration Background */}
              <div className="absolute bottom-0 right-0">
                <BookSvg width={110} height={102} />
              </div>

              <div className="relative">
                <h3 className="text-xs text-text-dark mb-2">執行時機</h3>
                <div className="flex flex-wrap gap-2">
                  {template.executionTiming.options.map((option, index) => (
                    <Badge
                      key={index}
                      variant="very-light-blue"
                      size="sm"
                      className="text-sm py-[3px] rounded gap-1"
                    >
                      <ClockSolidSvg
                        width={18}
                        height={18}
                        className="text-light-cyan"
                      />
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Execution Duration Card */}
            <div className="relative bg-white rounded-lg p-4 flex flex-col justify-between">
              {/* Cloud Illustration Background */}
              <div className="absolute -bottom-[10px] -right-[30px]">
                <IslandSvg width={86} height={31} />
              </div>
              <div>
                <h3 className="text-xs text-text-dark">執行時長</h3>
                <div className="flex items-baseline gap-0.5">
                  <div className="text-lg leading-7 font-medium text-logo-cyan">
                    {template.executionDuration.daysValue}
                  </div>
                  <div className="text-xs text-text-dark">
                    {template.executionDuration.daysUnit}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-xs leading-none text-text-dark">
                  開始日
                </span>
                <div className="text-sm leading-none text-logo-cyan">
                  {template.executionDuration.startDate}
                </div>
              </div>
              <div>
                <span className="text-xs leading-none text-text-dark">
                  結束日
                </span>
                <div className="text-sm leading-none text-logo-cyan">
                  {template.executionDuration.endDate}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Resources Section */}
          {Array.isArray(template.resources) &&
            template.resources.length > 0 && (
              <div>
                <h2 className="text-sm text-center font-medium text-white mt-4 mb-3.5">
                  推薦你使用以下資源
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {template.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="rounded-lg border border-logo-cyan bg-white"
                    >
                      <div className="relative aspect-169/93 rounded-t-lg overflow-hidden bg-bg-gray">
                        <Image
                          src={resource.thumbnail}
                          alt={resource.name}
                          fill
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1 text-xs text-text-dark p-2">
                        <span className="line-clamp-1">{resource.name}</span>
                        <Link2Icon className="size-4 text-logo-cyan shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Action Button */}
        <footer
          className={cn(
            "fixed bottom-0 left-0 right-0 flex justify-center p-6 bg-very-light-gray transition-transform duration-500 ease-out",
            showFooter ? "translate-y-0" : "translate-y-full"
          )}
        >
          <Button
            onClick={() => {
              // TODO: 處理開始實踐的邏輯
              router.push(`/practices/create/template/${templateId}/confirm`);
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
