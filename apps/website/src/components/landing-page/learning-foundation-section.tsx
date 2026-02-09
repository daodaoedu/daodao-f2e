"use client";

import { type PracticeTemplateType, usePracticeTemplates } from "@daodao/api";
import { BlueSvg, GreenSvg, PinkSvg, YellowSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";
import Stack from "@daodao/ui/components/stack";
import { ChevronRight, Loader2 } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";

// 主題 SVG 背景組件映射（參考 product/src/constants/practice-theme.ts）
const themeSvgMap = {
  yellow: YellowSvg,
  blue: BlueSvg,
  pink: PinkSvg,
  green: GreenSvg,
};

type PracticeTheme = keyof typeof themeSvgMap;

// 主題循環陣列，用於動態分配主題
const themeOrder: PracticeTheme[] = ["yellow", "pink", "blue", "green"];

// Product App URL
const PRODUCT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.daodao.so";

// 將 API 頻率轉換為顯示格式
const formatFrequency = (minDays: number | null, maxDays: number | null): string => {
  if (minDays === null || maxDays === null) return "3-5";
  return `${minDays}-${maxDays}`;
};

// 將模板資料轉換為卡片格式
const convertTemplateToCard = (template: PracticeTemplateType, index: number) => ({
  id: template.id,
  title: template.title,
  description: template.practiceAction || template.suggestedTags?.join("、") || template.title,
  frequency: formatFrequency(template.frequencyMinDays, template.frequencyMaxDays),
  frequencyUnit: "天/週",
  duration: String(template.sessionDurationMinutes ?? 30),
  durationUnit: "分/次",
  theme: themeOrder[index % themeOrder.length] as PracticeTheme,
  templateId: template.id,
});

// 滑動檢測閾值（像素）
const SWIPE_THRESHOLD = 10;

function PracticeCard({
  tag,
  title,
  description,
  frequency,
  frequencyUnit,
  duration,
  durationUnit,
  theme,
  templateId,
  onClick,
}: {
  tag: string;
  title: string;
  description: string;
  frequency: string;
  frequencyUnit: string;
  duration: string;
  durationUnit: string;
  theme: PracticeTheme;
  templateId: string;
  onClick?: (templateId: string) => void;
}) {
  const ThemeSvg = themeSvgMap[theme];
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    // 如果移動超過閾值，視為滑動
    if (dx > SWIPE_THRESHOLD || dy > SWIPE_THRESHOLD) {
      isDraggingRef.current = true;
    }
  };

  const handleClick = () => {
    // 如果是滑動，不執行點擊
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }
    onClick?.(templateId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      className="relative h-full w-full overflow-hidden rounded-2xl text-left cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* SVG 背景 */}
      <ThemeSvg className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" />

      {/* 內容層 */}
      <div className="relative flex h-full flex-col justify-between p-6">
        <div>
          <span className="inline-block rounded-full border border-primary-base bg-white/70 px-3 py-1 text-xs font-medium text-primary-darker">
            {tag}
          </span>
          <h3 className="mt-3 text-2xl font-bold text-primary-darker">{title}</h3>
          <p className="mt-2 text-sm text-basic-400">{description}</p>
        </div>

        {/* Speech bubble */}
        <div className="mt-4 flex justify-end">
          <div className="relative">
            <div className="rounded-lg bg-basic-500 px-4 py-2 text-sm text-white">
              喜歡嗎？馬上開始！
            </div>
            <div className="absolute -bottom-2 right-8 size-0 border-x-8 border-t-8 border-x-transparent border-t-basic-500" />
          </div>
        </div>

        {/* Stats + next button */}
        <div className="mt-4 flex items-end justify-between">
          <div className="flex items-baseline gap-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-primary-darker">{frequency}</span>
              <span className="ml-0.5 text-sm text-basic-400">{frequencyUnit}</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-primary-darker">{duration}</span>
              <span className="ml-0.5 text-sm text-basic-400">{durationUnit}</span>
            </div>
          </div>

          {/* Next button */}
          <div className="flex size-12 items-center justify-center rounded-full bg-white/80 shadow-sm group-hover:bg-white transition-colors">
            <ChevronRight className="size-5 text-basic-400" />
          </div>
        </div>
      </div>
    </button>
  );
}

export function LearningFoundationSection() {
  const t = useTranslations("common");
  const tag = t("landing_foundation_tag");

  // 從 API 取得模板資料
  const { data, isLoading } = usePracticeTemplates({ limit: 3 });

  // 跳轉到 Product App 模板詳情頁
  const handleCardClick = useCallback((templateId: string) => {
    window.location.href = `${PRODUCT_APP_URL}/practices/create/template/${templateId}`;
  }, []);

  // 將 API 資料轉換為卡片格式
  const cards = useMemo(() => {
    if (!data?.data || data.data.length === 0) {
      return [];
    }

    return data.data.map((template, index) => {
      const cardData = convertTemplateToCard(template, index);
      return (
        <PracticeCard
          key={cardData.id}
          tag={tag}
          {...cardData}
          onClick={handleCardClick}
        />
      );
    });
  }, [data, tag, handleCardClick]);

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      {/* Background blur decorations */}
      <Image
        src="/assets/landing-page/bg-blur-1.svg"
        alt=""
        width={837}
        height={831}
        className="pointer-events-none absolute -left-40 -top-20 w-[500px] md:-left-20 md:w-[837px]"
      />
      <Image
        src="/assets/landing-page/bg-blur-2.svg"
        alt=""
        width={558}
        height={558}
        className="pointer-events-none absolute -bottom-40 -right-40 w-[400px] md:-bottom-20 md:-right-20 md:w-[558px]"
      />

      <div className="container relative z-10 mx-auto px-6">
        {/* Header - centered */}
        <div className="mb-12 text-center">
          <h2 className="whitespace-pre-line text-[1.75rem] font-bold leading-tight md:text-3xl">
            <span className="text-primary-darker">{t("landing_foundation_title")}</span>
            <span className="text-primary-base">{t("landing_foundation_title_highlight")}</span>
          </h2>
          <p className="mt-3 text-sm text-basic-400">{t("landing_foundation_subtitle_1")}</p>
          <p className="mt-1 text-sm text-basic-400">{t("landing_foundation_subtitle_2")}</p>
        </div>

        {/* Card Stack - centered */}
        <div className="relative mx-auto h-[360px] w-[300px] md:h-[400px] md:w-[340px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary-base" />
            </div>
          ) : cards.length > 0 ? (
            <Stack
              cards={cards}
              sendToBackOnClick={false}
              mobileClickOnly
              autoplay
              autoplayDelay={4000}
              pauseOnHover
              sensitivity={80}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-basic-400">
              暫無推薦模板
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
