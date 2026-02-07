"use client";

import Stack from "@daodao/ui/components/stack";
import { Image } from "@daodao/ui/components/image";

const PRACTICE_CARDS = [
  {
    id: 1,
    tag: "主題實踐",
    title: "自己準備便當",
    description: "開始為自己做上班的健康午餐便當",
    frequency: "3-5 天/週",
    duration: "30 分/次",
    bgColor: "bg-[#FFF3D0]",
    borderColor: "border-[#FFD966]",
  },
  {
    id: 2,
    tag: "主題實踐",
    title: "每日英文閱讀",
    description: "養成每天閱讀英文文章的習慣",
    frequency: "5-7 天/週",
    duration: "20 分/次",
    bgColor: "bg-[#FFE0E6]",
    borderColor: "border-[#FF9AAD]",
  },
  {
    id: 3,
    tag: "主題實踐",
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
}: (typeof PRACTICE_CARDS)[number]) {
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
          <Image
            src="/assets/landing-page/icon-clock.svg"
            alt=""
            width={16}
            height={16}
          />
          <span>{frequency}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Image
            src="/assets/landing-page/icon-clock.svg"
            alt=""
            width={16}
            height={16}
          />
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
}

export function LearningFoundationSection() {
  const cards = PRACTICE_CARDS.map((card) => (
    <PracticeCard key={card.id} {...card} />
  ));

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
          {/* Left: Text */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-[1.75rem] font-bold text-primary-darker">
              從好奇開始
              <br />
              小步實踐生活裡的學習靈感
            </h2>
            <p className="mt-3 text-sm text-basic-400">
              7-30 天輕量學習計畫
            </p>
            <p className="mt-1 text-sm text-basic-400">
              不需要完美，只要開始探索就有收穫
            </p>
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
