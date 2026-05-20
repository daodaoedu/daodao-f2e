"use client";

import { type PracticeTemplateType, usePracticeTemplates } from "@daodao/api";
import { BlueSvg, GreenSvg, PinkSvg, YellowSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { ANCHOR_IDS } from "@daodao/shared";
import { Image } from "@daodao/ui/components/image";
import Stack from "@daodao/ui/components/stack";
import { ChevronRight, Loader2 } from "lucide-react";
import { useCallback, useMemo } from "react";

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
const convertTemplateToCard = (
  template: PracticeTemplateType,
  index: number,
  frequencyUnit: string,
  durationUnit: string,
) => ({
  id: template.id,
  title: template.title,
  description: template.practiceAction || template.suggestedTags?.join("、") || template.title,
  frequency: formatFrequency(template.frequencyMinDays, template.frequencyMaxDays),
  frequencyUnit,
  duration: String(template.sessionDurationMinutes ?? 30),
  durationUnit,
  theme: themeOrder[index % themeOrder.length] as PracticeTheme,
  templateId: template.id,
});

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
  isActive = false,
  onClick,
  speechBubbleText,
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
  isActive?: boolean;
  onClick?: (templateId: string) => void;
  speechBubbleText: string;
}) {
  const ThemeSvg = themeSvgMap[theme];

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(templateId);
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl text-left">
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

        {/* Speech bubble - 只有當前顯示的卡片顯示 */}
        {isActive && (
          <div className="mt-4 flex justify-end">
            <div className="relative">
              <div className="rounded-lg bg-basic-500 px-4 py-2 text-sm text-white">
                {speechBubbleText}
              </div>
              <div className="absolute -bottom-2 right-8 size-0 border-x-8 border-t-8 border-x-transparent border-t-basic-500" />
            </div>
          </div>
        )}

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

          {/* Next button - 只有這裡可以點擊跳轉 */}
          <button
            type="button"
            onClick={handleIconClick}
            className="flex size-12 items-center justify-center rounded-full bg-white/80 shadow-sm hover:bg-white active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="size-5 text-basic-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function LearningFoundationSection() {
  const t = useTranslations("common");
  const tLanding = useTranslations("landing_page");
  const tag = t("landing_foundation_tag");
  const frequencyUnit = tLanding("foundation_frequency_unit");
  const durationUnit = tLanding("foundation_duration_unit");
  const speechBubbleText = tLanding("foundation_speech_bubble");
  const emptyText = tLanding("foundation_empty_state");

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
      const cardData = convertTemplateToCard(template, index, frequencyUnit, durationUnit);
      return <PracticeCard key={cardData.id} tag={tag} {...cardData} onClick={handleCardClick} speechBubbleText={speechBubbleText} />;
    });
  }, [data, tag, handleCardClick, frequencyUnit, durationUnit, speechBubbleText]);

  return (
    <section
      id={ANCHOR_IDS.LEARNING_INSPIRATION}
      className="relative overflow-hidden bg-white py-16 md:py-24"
    >
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
              sendToBackOnClick
              autoplay
              autoplayDelay={4000}
              pauseOnHover
              sensitivity={80}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-basic-400">
              {emptyText}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
