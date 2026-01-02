"use client";

import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@daodao/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@daodao/ui/components/carousel";
import { useScrollLock } from "@daodao/shared";
import { PracticeCard } from "./practice-card";
import { PracticeTopicGrid } from "./practice-topic-grid";
import { CreateCustomPracticeSheet } from "./create-custom-practice-sheet";
import { BackgroundAnimation } from "@/components/layout";

// 模擬數據 - 之後可以從 API 取得
const featuredPractices = [
  {
    id: 1,
    category: "學程式",
    title: "學習 vibe coding",
    description: "看30天線上教學、實際做一個專案",
  },
  {
    id: 2,
    category: "學設計",
    title: "學習 UI/UX 設計",
    description: "完成 5 個設計專案，建立作品集",
  },
  {
    id: 3,
    category: "學語言",
    title: "每天學英文 30 分鐘",
    description: "透過 App 和影片學習，持續 30 天",
  },
];

interface CreatePracticeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePracticeSheet = ({
  open,
  onOpenChange,
}: CreatePracticeSheetProps) => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  // 根據 open 狀態來控制滾動鎖定
  useScrollLock(open);

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 pt-15 overflow-hidden overflow-y-auto bg-white">
      <BackgroundAnimation />

      <div className="flex justify-end absolute top-5 right-5 md:static md:max-w-4xl md:mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label="關閉"
          animation="none"
        >
          <X className="size-5 text-light-gray" />
        </Button>
      </div>

      <div className="relative px-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center pt-5 md:pt-10">
          <h2 className="text-xs md:text-sm text-text-dark mb-3">主題實踐</h2>
          <h1 className="text-2xl md:text-4xl font-semibold text-text-dark mb-3 relative">
            小而美的學習生活提案
            {/* Radial Lines Background */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%-36px)] md:-translate-y-1/2 size-[558px] pointer-events-none -z-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                  `<svg width="558" height="558" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="sunFade" cx="50%" cy="50%">
                        <stop offset="0%" stop-color="white" stop-opacity="1"/>
                        <stop offset="80%" stop-color="white" stop-opacity="0.9"/>
                        <stop offset="100%" stop-color="white" stop-opacity="0"/>
                      </radialGradient>
                      <mask id="sunMask">
                        <rect width="100%" height="100%" fill="url(#sunFade)"/>
                      </mask>
                    </defs>
                    <g mask="url(#sunMask)">
                      ${Array.from({ length: 32 }, (_, i) => {
                        const angle = (i * 360) / 32;
                        const rad = (angle * Math.PI) / 180;
                        const center = 279;
                        const radius = 279;
                        const x1 = center;
                        const y1 = center;
                        const x2 = center + Math.cos(rad) * radius;
                        const y2 = center + Math.sin(rad) * radius;
                        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="1.5" stroke-linecap="round"/>`;
                      }).join("")}
                      <circle cx="279" cy="279" r="2" fill="white"/>
                    </g>
                  </svg>`
                )}")`,
              }}
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
      </div>

      {/* Practice Topics Grid */}
      <PracticeTopicGrid />

      {/* Create Custom Practice Button */}
      <div className="flex justify-center mt-8 mb-4">
        <Button variant="white" onClick={() => setIsCreateSheetOpen(true)}>
          我想自己建立
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Create Custom Practice Sheet */}
      <CreateCustomPracticeSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
      />
    </div>
  );
};
