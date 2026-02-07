"use client";

import { ClockSolidSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import Stack from "@daodao/ui/components/stack";
import { useMemo } from "react";

const PRACTICE_CARDS = [
  {
    id: 1,
    title: "自己準備便當",
    description: "開始為自己做上班的健康午餐便當",
    frequency: "3-5 天/週",
    duration: "30 分/次",
    bgColor: "bg-[#FFF3D0]",
    borderColor: "border-[#FFD966]",
  },
  {
    id: 2,
    title: "每日英文閱讀",
    description: "養成每天閱讀英文文章的習慣",
    frequency: "5-7 天/週",
    duration: "20 分/次",
    bgColor: "bg-[#FFE0E6]",
    borderColor: "border-[#FF9AAD]",
  },
  {
    id: 3,
    title: "攝影散步練習",
    description: "用鏡頭記錄生活中的美好瞬間",
    frequency: "2-3 天/週",
    duration: "45 分/次",
    bgColor: "bg-[#D4EDFC]",
    borderColor: "border-[#7BC4F0]",
  },
];

function PracticeCard({
  tag,
  title,
  description,
  frequency,
  duration,
  bgColor,
  borderColor,
}: {
  tag: string;
  title: string;
  description: string;
  frequency: string;
  duration: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div
      className={`${bgColor} ${borderColor} flex h-full w-full flex-col justify-between rounded-2xl border-2 p-6`}
    >
      <div>
        <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-primary-darker">
          {tag}
        </span>
        <h3 className="mt-3 text-xl font-bold text-primary-darker">{title}</h3>
        <p className="mt-2 text-sm text-basic-400">{description}</p>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-basic-400">
        <div className="flex items-center gap-1.5">
          <ClockSolidSvg className="size-4 text-basic-300" />
          <span>{frequency}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ClockSolidSvg className="size-4 text-basic-300" />
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
}

export function LearningFoundationSection() {
  const t = useTranslations("common");
  const tag = t("landing_foundation_tag");

  const cards = useMemo(
    () => PRACTICE_CARDS.map((card) => <PracticeCard key={card.id} tag={tag} {...card} />),
    [tag]
  );

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
          {/* Left: Text */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="whitespace-pre-line text-[1.75rem] font-bold text-primary-darker">
              {t("landing_foundation_title")}
            </h2>
            <p className="mt-3 text-sm text-basic-400">{t("landing_foundation_subtitle_1")}</p>
            <p className="mt-1 text-sm text-basic-400">{t("landing_foundation_subtitle_2")}</p>
          </div>

          {/* Right: Card Stack */}
          <div className="relative h-[320px] w-[280px] flex-shrink-0 md:h-[360px] md:w-[320px]">
            <Stack
              cards={cards}
              sendToBackOnClick
              mobileClickOnly
              autoplay
              autoplayDelay={4000}
              pauseOnHover
              sensitivity={80}
            />
          </div>
        </div>
      </div>

      {/* Decorative elements - placeholder */}
      <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 md:block">
        <div className="h-8 w-8 rotate-45 bg-tips/30" />
      </div>
    </section>
  );
}
