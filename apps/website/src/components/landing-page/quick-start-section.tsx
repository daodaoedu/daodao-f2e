"use client";

import { BulbSvg, ClockSolidSvg } from "@daodao/assets";
import { Image } from "@daodao/ui/components/image";

export function QuickStartSection() {
  const stats = [
    { label: "總共持續", value: "14", unit: "天" },
    { label: "每週頻率", value: "3-5", unit: "天" },
    { label: "每次執行", value: "30", unit: "分鐘" },
  ];

  const timeSlots = [
    { label: "早餐前" },
    { label: "通勤時" },
    { label: "睡前" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#F4F6F6] py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center">
          {/* 標題 */}
          <h2 className="mb-4 text-center text-[1.75rem] font-bold leading-tight md:text-3xl">
            <span className="text-primary-base">快速啟動</span>
            <span className="text-primary-darker">你的學習旅程</span>
          </h2>

          {/* 副標題 */}
          <p className="mb-10 text-center text-sm leading-relaxed text-basic-400">
            給馬上想要行動的你
            <br />
            一個最沒有負擔的開始
          </p>

          {/* 統計卡片 */}
          <div className="mb-10 flex w-full max-w-md justify-center gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-1 flex-col items-center rounded-xl bg-white px-4 py-4 shadow-sm"
              >
                <span className="text-sm text-basic-400">{stat.label}</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary-base">
                    {stat.value}
                  </span>
                  <span className="text-sm text-basic-400">{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 吉祥物和執行時機區塊 */}
          <div className="relative mb-8 flex w-full max-w-md items-center justify-center">
            {/* 左側：吉祥物插圖（無框） */}
            <div className="relative z-10 -mr-8">
              <Image
                src="/assets/landing-page/mascot-rocket.svg"
                alt="吉祥物"
                width={160}
                height={160}
                className="object-contain"
              />
            </div>

            {/* 右側：執行時機 */}
            <div className="relative z-20 flex w-[200px] flex-col rounded-xl bg-white p-5 pt-8 shadow-sm">
              {/* 燈泡圖標突出在上方 */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                <BulbSvg className="size-10 text-logo-yellow" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-primary-darker">執行時機</h3>
              <div className="flex flex-col gap-3">
                {timeSlots.map((slot) => (
                  <div key={slot.label} className="flex items-center gap-2">
                    <ClockSolidSvg className="size-5 text-primary-base" />
                    <span className="text-sm text-basic-400">{slot.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 右下角書本裝飾 */}
            <div className="absolute -bottom-4 -right-4 z-0">
              <Image
                src="/assets/landing-page/deco-books.svg"
                alt=""
                width={80}
                height={80}
                className="object-contain opacity-60"
              />
            </div>
          </div>

          {/* 底部訊息 */}
          <div className="rounded-full border border-primary-base bg-white px-6 py-3">
            <p className="text-center text-sm text-primary-darker">
              隨時修改沒有壓力，節奏由你決定
            </p>
          </div>
        </div>
      </div>

      {/* 底部波浪裝飾 */}
      <div className="absolute -bottom-1 left-0 w-full">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120V60C240 20 480 0 720 0C960 0 1200 20 1440 60V120H0Z"
            fill="#16B9B3"
          />
        </svg>
      </div>
    </section>
  );
}
