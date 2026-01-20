"use client";

import { useRouter } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@daodao/ui/components/carousel";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { BgRadialAnimation } from "@/components/layout/bg-radial-animation";
import {
  ArtSvg,
  HealthSvg,
  LanguageSvg,
  LifeSvg,
  TechSvg,
} from "@daodao/assets";

// 類別定義
type CategoryId = "language" | "lifestyle" | "digital" | "art" | "health";

interface Category {
  id: CategoryId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: Category[] = [
  { id: "language", label: "語言", icon: LanguageSvg },
  { id: "lifestyle", label: "生活品味", icon: LifeSvg },
  { id: "digital", label: "數位技能", icon: TechSvg },
  { id: "art", label: "藝術與設計", icon: ArtSvg },
  { id: "health", label: "身心健康", icon: HealthSvg },
];

// 模擬數據 - 之後可以從 API 取得
const practicesByCategory: Record<
  CategoryId,
  Array<{ id: number; title: string; description: string; templateId: string }>
> = {
  language: [
    {
      id: 1,
      title: "每天學英文 30 分鐘",
      description: "透過 App 和影片學習，持續 30 天",
      templateId: "learn-english-30min",
    },
    {
      id: 2,
      title: "日語基礎學習",
      description: "每天學習 1 小時日語，持續 60 天",
      templateId: "learn-japanese-basic",
    },
  ],
  lifestyle: [
    {
      id: 100,
      title: "冥想",
      description: "看 Youtube 教學,每晚睡前練習",
      templateId: "meditation",
    },
    {
      id: 3,
      title: "冥想",
      description: "看 Youtube 教學,每晚睡前練習",
      templateId: "meditation",
    },
    {
      id: 4,
      title: "學習減脂料理",
      description: "追蹤 IG 厲害的創作者,每週末練習一個食譜",
      templateId: "learn-fat-loss-cooking",
    },
    {
      id: 5,
      title: "學習減脂料理",
      description: "追蹤 IG 厲害的創作者,每週末練習一個食譜",
      templateId: "learn-fat-loss-cooking-2",
    },
    {
      id: 6,
      title: "冥想",
      description: "看 Youtube 教學,每晚睡前練習",
      templateId: "meditation-2",
    },
  ],
  digital: [
    {
      id: 7,
      title: "學習 vibe coding",
      description: "看30天線上教學、實際做一個專案",
      templateId: "learn-vibe-coding",
    },
    {
      id: 8,
      title: "學習 UI/UX 設計",
      description: "完成 5 個設計專案，建立作品集",
      templateId: "learn-uiux-design",
    },
  ],
  art: [
    {
      id: 9,
      title: "電繪光影技巧",
      description: "完成 10 個光影練習作品",
      templateId: "digital-painting-lighting",
    },
    {
      id: 10,
      title: "角色設計",
      description: "設計 5 個原創角色",
      templateId: "character-design",
    },
  ],
  health: [
    {
      id: 11,
      title: "每天情緒日記",
      description: "每天記錄情緒和感受",
      templateId: "daily-emotion-journal",
    },
    {
      id: 12,
      title: "睡前伸展操",
      description: "每天睡前做 15 分鐘伸展",
      templateId: "bedtime-stretching",
    },
  ],
};

export default function CreatePracticePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryId>("lifestyle");

  const handleTemplateSelect = (templateId: string) => {
    router.push(`/practices/create/template/${templateId}`);
  };

  const handleCategoryClick = (categoryId: CategoryId) => {
    setSelectedCategory(categoryId);
  };

  const currentPractices = practicesByCategory[selectedCategory] || [];

  // 將 practices 每 2 個分組
  const practiceGroups = useMemo(() => {
    const groups: Array<{
      id: string;
      items: Array<(typeof currentPractices)[0]>;
    }> = [];
    for (let i = 0; i < currentPractices.length; i += 2) {
      groups.push({
        id: `${selectedCategory}-group-${Math.floor(i / 2)}`,
        items: currentPractices.slice(i, i + 2),
      });
    }
    return groups;
  }, [currentPractices, selectedCategory]);

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-linear-to-br from-[#F5F9E8] via-white to-[#F0F4F8]">
      <BackgroundAnimation />

      <PageHeader rightActionTo="/" />

      <main className="relative px-4 max-w-[600px] mx-auto pb-8">
        {/* Header */}
        <div className="text-center pt-5 md:pt-12">
          <Badge
            size="sm"
            variant="secondary"
            className="text-xs md:text-sm text-text-dark mb-3"
          >
            主題實踐
          </Badge>
          <h1 className="text-2xl md:text-4xl font-semibold text-text-dark mb-3 relative">
            小而美的學習生活提案
            <BgRadialAnimation
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%-64px)] md:-translate-y-[calc(50%-24px)] -z-10"
              variant="deco"
            />
          </h1>
          <p className="md:text-lg text-text-dark/70 text-center">
            不需要完美
            <br />
            只要開始探索就有收穫
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex gap-2 md:gap-3 justify-start md:justify-center mt-6 md:mt-8 mb-6 md:mb-8 pb-2 overflow-x-auto md:overflow-x-visible scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "white"}
                onClick={() => handleCategoryClick(category.id)}
                aria-label={`選擇類別：${category.label}`}
                className={cn(
                  "h-12 rounded-lg shrink-0 whitespace-nowrap",
                  isSelected && "pointer-events-none"
                )}
              >
                <Icon
                  className={cn(
                    "size-5 md:size-6",
                    isSelected ? "text-white" : "text-text-dark/60"
                  )}
                />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Practice Cards Grid */}
        <div className="relative w-[472px] mx-auto">
          <Carousel className="w-full" opts={{ loop: false, align: "start" }}>
            <CarouselContent className="-ml-2">
              {practiceGroups.map((group) => (
                <CarouselItem key={group.id} className="pl-2 basis-1/2">
                  <div className="flex flex-col gap-2">
                    {group.items.map((practice) => (
                      <button
                        key={practice.id}
                        type="button"
                        onClick={() =>
                          handleTemplateSelect(practice.templateId)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleTemplateSelect(practice.templateId);
                          }
                        }}
                        aria-label={`選擇提案：${practice.title}`}
                        className={cn(
                          "w-full bg-[#E9FEFFB2]/70 rounded-lg px-6 py-4 border-2 border-[#C1ECFF] cursor-pointer",
                          "text-left focus-visible:outline-2 focus-visible:outline-logo-cyan focus-visible:outline-offset-2",
                          "flex items-center justify-between gap-2 group w-[232px] h-[104px] backdrop-blur-lg"
                        )}
                      >
                        <div className="flex-1 flex flex-col h-full min-w-0">
                          <h3 className="font-medium text-bg-dark line-clamp-1 mb-1">
                            {practice.title}
                          </h3>
                          <p className="text-sm text-text-dark line-clamp-2 flex-1">
                            {practice.description}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <ChevronRight className="size-4.5 text-text-dark group-hover:text-logo-cyan transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              variant="ghost"
              size="icon"
              className="absolute -left-16 top-1/2 -translate-y-1/2 z-20 size-8 md:size-10 text-text-dark/70 hover:text-text-dark hover:opacity-100 bg-white/80 hover:bg-white shadow-md"
              aria-label="上一個"
            />
            <CarouselNext
              variant="ghost"
              size="icon"
              className="absolute -right-16 top-1/2 -translate-y-1/2 z-20 size-8 md:size-10 text-text-dark/70 hover:text-text-dark hover:opacity-100 bg-white/80 hover:bg-white shadow-md"
              aria-label="下一個"
            />
          </Carousel>
        </div>

        {/* Create Manual Practice Button */}
        <div className="flex justify-center mt-8 mb-4">
          <Button
            variant="white"
            onClick={() => router.push("/practices/create/manual")}
          >
            我想自己建立
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
