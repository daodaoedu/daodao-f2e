"use client";

import { useTranslations } from "@daodao/i18n";
import Stack from "@daodao/ui/components/stack";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";

const PRACTICE_CARDS = [
  {
    id: 1,
    title: "自己準備便當",
    description: "開始為自己做上班的健康午餐便當",
    frequency: "3-5",
    frequencyUnit: "天/週",
    duration: "30",
    durationUnit: "分/次",
    bgColor: "bg-[#FFF3D0]",
    borderColor: "border-[#FFD966]",
  },
  {
    id: 2,
    title: "每日英文閱讀",
    description: "養成每天閱讀英文文章的習慣",
    frequency: "5-7",
    frequencyUnit: "天/週",
    duration: "20",
    durationUnit: "分/次",
    bgColor: "bg-[#FFE0E6]",
    borderColor: "border-[#FF9AAD]",
  },
  {
    id: 3,
    title: "攝影散步練習",
    description: "用鏡頭記錄生活中的美好瞬間",
    frequency: "2-3",
    frequencyUnit: "天/週",
    duration: "45",
    durationUnit: "分/次",
    bgColor: "bg-[#D4EDFC]",
    borderColor: "border-[#7BC4F0]",
  },
];

function PracticeCard({
  tag,
  title,
  description,
  frequency,
  frequencyUnit,
  duration,
  durationUnit,
  bgColor,
  borderColor,
}: {
  tag: string;
  title: string;
  description: string;
  frequency: string;
  frequencyUnit: string;
  duration: string;
  durationUnit: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div
      className={`${bgColor} ${borderColor} flex h-full w-full flex-col justify-between rounded-2xl border-2 p-6`}
    >
      <div>
        <span className="inline-block rounded-full border border-primary-base px-3 py-1 text-xs font-medium text-primary-darker">
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
          <div className="absolute -bottom-2 right-8 size-0 border-x-[8px] border-t-[8px] border-x-transparent border-t-basic-500" />
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
        <div className="flex size-12 items-center justify-center rounded-full bg-white/80 shadow-sm">
          <ChevronRight className="size-5 text-basic-400" />
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
    <section className="relative overflow-hidden bg-[#F4F6F8] py-16 md:py-24">
      <div className="container mx-auto px-6">
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
    </section>
  );
}
