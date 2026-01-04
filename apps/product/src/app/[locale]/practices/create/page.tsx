"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@daodao/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@daodao/ui/components/carousel";
import { PracticeCard } from "@/components/create-practice/practice-card";
import { PracticeTopicGrid } from "@/components/create-practice/practice-topic-grid";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { BgRadialAnimation } from "@/components/layout/bg-radial-animation";
import { useRouter } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";

// 模擬數據 - 之後可以從 API 取得
const featuredPractices = [
  {
    id: 1,
    category: "學程式",
    title: "學習 vibe coding",
    description: "看30天線上教學、實際做一個專案",
    templateId: "learn-vibe-coding",
  },
  {
    id: 2,
    category: "學設計",
    title: "學習 UI/UX 設計",
    description: "完成 5 個設計專案，建立作品集",
    templateId: "learn-uiux-design",
  },
  {
    id: 3,
    category: "學語言",
    title: "每天學英文 30 分鐘",
    description: "透過 App 和影片學習，持續 30 天",
    templateId: "learn-english-30min",
  },
];

export default function CreatePracticePage() {
  const router = useRouter();

  const handleTemplateSelect = (templateId: string) => {
    router.push(`/practices/create/template/${templateId}`);
  };

  return (
    <div className="fixed inset-0 z-30 overflow-hidden overflow-y-auto bg-white">
      <BackgroundAnimation />

      <PageHeader closeTo="/" />

      <main className="relative px-4 max-w-[600px] mx-auto">
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
          <p className="md:text-lg text-text-dark text-center">
            不需要完美
            <br />
            只要開始探索就有收穫
          </p>
        </div>

        {/* Featured Practice Card */}
        <div className="my-[5%]">
          <Carousel className="w-full max-w-md mx-auto" opts={{ loop: true }}>
            <div className="relative mask-luminance mask-[linear-gradient(to_right,black_6px,white_26px,white_calc(100%-26px),black_calc(100%-6px))]">
              <CarouselContent className="ml-0">
                {featuredPractices.map((practice) => (
                  <CarouselItem key={practice.id} className="pl-0">
                    <PracticeCard
                      category={practice.category}
                      title={practice.title}
                      description={practice.description}
                      templateId={practice.templateId}
                      onClick={handleTemplateSelect}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </div>
            <CarouselPrevious
              variant="ghost"
              size="icon"
              className="absolute -left-5 z-20 size-10 text-text-dark opacity-70 hover:opacity-100"
              aria-label="上一個"
            />
            <CarouselNext
              variant="ghost"
              size="icon"
              className="absolute -right-5 z-20 size-10 text-text-dark opacity-70 hover:opacity-100"
              aria-label="下一個"
            />
          </Carousel>
        </div>
      </main>

      {/* Practice Topics Grid */}
      <PracticeTopicGrid onTopicClick={handleTemplateSelect} />

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
    </div>
  );
}
