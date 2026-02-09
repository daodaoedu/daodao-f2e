"use client";

import { Image } from "@daodao/ui/components/image";

export function QuickStartSection() {
  const stats = [
    { label: "總共持續", value: "14", unit: "天" },
    { label: "每週頻率", value: "3-5", unit: "天" },
    { label: "每次執行", value: "30", unit: "分鐘" },
  ];

  return (
    <section className="relative overflow-hidden bg-basic-100 py-16 md:py-24">
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
                  <span className="text-2xl font-bold text-primary-base">{stat.value}</span>
                  <span className="text-sm text-basic-400">{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 吉祥物和執行時機區塊 */}
          <div className="relative mb-8 flex w-full max-w-md items-center justify-center gap-4">
            {/* 左側：吉祥物插圖 */}
            <div className="relative">
              <Image
                src="/assets/landing-page/joyride.svg"
                alt="吉祥物"
                width={160}
                height={160}
                className="object-contain"
              />
            </div>

            {/* 右側：執行時機 */}
            <div className="relative">
              <Image
                src="/assets/landing-page/timing.svg"
                alt="執行時機"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>

          {/* 底部訊息 */}
          <div className="rounded-full border border-primary-base bg-primary-pale px-6 py-3">
            <p className="text-center text-sm font-medium text-primary-darker">
              隨時修改沒有壓力，節奏由你決定
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
