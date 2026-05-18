"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader, RefreshCcw } from "lucide-react";
import { ArrowRightOutlineSvg, CompassSvg, Deco4Svg } from "@daodao/assets";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  ExecutionDurationCard,
  ExecutionTimingCard,
  PracticeOverviewCard,
  ResourceCard,
} from "@/components/practice";
import {
  DurationDays,
  ExecutionTiming,
  Frequency,
} from "@/constants/practice-form";
import { practiceCategoryMetadataMap, practiceCategories } from "@/constants/practice-category";

const MOCK_TEMPLATE = {
  name: "每天閱讀 30 分鐘",
  actionDescription: "每天睡前靜心閱讀一本紙本好書，遠離螢幕，沉澱忙碌的一天",
  frequency: Frequency.threeToFive,
  durationMinutes: 30,
  startDate: "2026-05-16",
  durationDays: DurationDays.twentyOne,
  executionTiming: [ExecutionTiming.beforeSleep],
  customTiming: "",
  tags: ["閱讀", "習慣養成", "睡前儀式", "知識成長"],
  resources: [
    { id: "r1", name: "《原子習慣》James Clear", url: "https://jamesclear.com/atomic-habits" },
    { id: "r2", name: "Readwise — 閱讀筆記工具", url: "https://readwise.io" },
  ],
};

export default function TemplateDetailMockupPage() {
  const [showActions, setShowActions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof practiceCategories[number]>("lifestyle");
  const selectedCategoryMeta = practiceCategoryMetadataMap[selectedCategory];

  useEffect(() => {
    const timer = setTimeout(() => setShowActions(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCreate = () => {
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
      {/* Mockup Banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex justify-between items-center px-4 py-1.5 bg-amber-400/90 backdrop-blur-sm text-amber-900 text-xs font-medium">
        <span>🎨 UX Mockup — template-category-selector</span>
        <Link href="/ux-mockup" className="underline text-amber-800 hover:text-amber-900">← UX Mockups</Link>
      </div>

      <Deco4Svg className="absolute top-0 right-0" width={270} height={484} />

      {/* Top Nav */}
      <div className="pt-9">
        <PageHeader leftAction="back" leftLabel="" variant="light" />
      </div>

      <main className="relative max-w-[600px] md:max-w-[680px] mx-auto pb-8">
        {/* Header */}
        <div className="py-4">
          <div className="max-w-[448px] mx-auto px-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="secondary"
                  size="sm"
                  className="text-xs md:text-sm mb-2 cursor-pointer gap-1 hover:bg-white/90 transition-colors"
                >
                  {selectedCategoryMeta.label}
                  <ChevronDown className="size-3 opacity-70" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={0} className="mt-0.5 w-44">
                {practiceCategories.map((categoryId) => {
                  const meta = practiceCategoryMetadataMap[categoryId];
                  const Icon = meta.icon;
                  return (
                    <DropdownMenuItem
                      key={categoryId}
                      onClick={() => setSelectedCategory(categoryId)}
                      className={cn(
                        "gap-2 min-h-[44px] text-text-dark",
                        selectedCategory === categoryId && "font-medium text-logo-cyan"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {meta.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex md:flex-col md:gap-3">
              <div className="flex flex-1 items-start gap-1">
                <div className="flex-1">
                  <h1 className="text-2xl leading-normal md:text-4xl font-medium text-white mb-1">
                    {MOCK_TEMPLATE.name}
                  </h1>
                  <p className="text-sm text-white">{MOCK_TEMPLATE.actionDescription}</p>
                </div>
                {/* Mobile：右側 */}
                <div className="shrink-0 md:hidden">
                  <Button
                    variant="white"
                    onClick={handleRefresh}
                    disabled={!showActions || isRefreshing}
                    className="group text-sm font-normal h-[35px] px-3 transition-opacity duration-500 ease-out"
                  >
                    {isRefreshing ? (
                      <Loader className="size-4.5 animate-spin" />
                    ) : showActions ? (
                      <RefreshCcw className="size-4.5 group-hover:animate-spin-reverse" />
                    ) : (
                      <Loader className="size-4.5 animate-spin" />
                    )}
                    換一個
                  </Button>
                </div>
              </div>
              {/* Desktop：描述下方 */}
              <div className="hidden md:block">
                <Button
                  variant="white"
                  onClick={handleRefresh}
                  disabled={!showActions || isRefreshing}
                  className="group text-sm font-normal h-[35px] px-3 transition-opacity duration-500 ease-out"
                >
                  {isRefreshing ? (
                    <Loader className="size-4.5 animate-spin" />
                  ) : showActions ? (
                    <RefreshCcw className="size-4.5 group-hover:animate-spin-reverse" />
                  ) : (
                    <Loader className="size-4.5 animate-spin" />
                  )}
                  換一個
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* White Content */}
        <div className="bg-white rounded-t-2xl md:max-w-[488px] md:mx-auto md:rounded-2xl">
          <div className="pt-4 px-5 pb-28">
            {/* Overview Card */}
            <div className="relative mb-3.5">
              <div className="absolute -top-14 -right-1 z-10">
                <CompassSvg width={109} height={114} />
              </div>
              <PracticeOverviewCard
                actionDescription={MOCK_TEMPLATE.actionDescription}
                frequency={MOCK_TEMPLATE.frequency}
                durationMinutes={MOCK_TEMPLATE.durationMinutes}
                tags={MOCK_TEMPLATE.tags}
              />
            </div>

            {/* Timing + Duration */}
            <div className="grid grid-cols-2 gap-4 mb-3.5">
              <ExecutionTimingCard
                executionTiming={MOCK_TEMPLATE.executionTiming}
                customTiming={MOCK_TEMPLATE.customTiming}
              />
              <ExecutionDurationCard
                durationDays={MOCK_TEMPLATE.durationDays}
                startDate={MOCK_TEMPLATE.startDate}
              />
            </div>

            {/* Resources */}
            {MOCK_TEMPLATE.resources.length > 0 && (
              <div>
                <h2 className="text-sm text-center font-medium text-white mt-4 mb-3.5">
                  推薦你使用以下資源
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {MOCK_TEMPLATE.resources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={{ id: resource.id, name: resource.name, url: resource.url }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer — slide up after 1.5s */}
        <footer
          className={cn(
            "fixed bottom-0 left-0 right-0 flex justify-center p-6 bg-very-light-gray transition-transform duration-500 ease-out border-t border-light-gray",
            showActions ? "translate-y-0" : "translate-y-full"
          )}
        >
          <Button
            onClick={handleCreate}
            disabled={isSubmitting}
            variant="orange"
            className="w-full sm:max-w-[288px]"
          >
            {isSubmitting ? (
              <>
                <Loader className="size-4.5 animate-spin" />
                建立中...
              </>
            ) : (
              <>
                看起來不錯
                <ArrowRightOutlineSvg className="size-4.5" />
              </>
            )}
          </Button>
        </footer>
      </main>
    </div>
  );
}
