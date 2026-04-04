/**
 * Dev Preview — 打卡紀錄頁（不需登入）
 * 路徑: /dev/checkin-preview
 * 完全比照 /practices/[id]/check-ins/[checkInId]/page.tsx 的 layout
 */

"use client";

import { Deco4Svg } from "@daodao/assets";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SWRConfig, unstable_serialize } from "swr";
import { CheckInDetail } from "@/components/check-in/display/check-in-detail";
import type { ICheckInDisplayData } from "@/components/check-in/types";

// ── Mock 打卡資料 ─────────────────────────────────────────────────────────────

const MOCK_CHECK_IN_ID = "mock-checkin-preview-1";

const mockCheckIn: ICheckInDisplayData = {
  id: MOCK_CHECK_IN_ID,
  date: "2026.03.31",
  mood: "happy",
  content:
    "雖然網路上很多免費筆刷可以下載，但 Procreate 內建的筆刷就很夠用了！\n\n今天試著用「6B 鉛筆」畫了幾個小物，意外發現質感很不錯，線條很自然。光是筆壓的變化就能呈現出豐富的層次，完全不需要外掛。\n\n下次想試試水彩筆刷看看效果如何。聽說配合「柔和噴槍」一起用，可以做出很漂亮的暈染感，等下一個主題再來挑戰！\n\n另外今天也在 YouTube 找到一個很棒的教學頻道，專門教 Procreate 的基礎技法，節奏不快、講解很清楚，決定接下來跟著他的系列課程練習看看。\n\n整體來說今天的練習時間約 40 分鐘，比預計多了一點但完全值得，非常沉浸在繪畫的過程中，有種久違的放空感。",
  tags: ["Procreate", "數位繪圖", "每日練習"],
  images: [],
  practiceTitle: "Procreate 小物繪畫練習",
};

// ── SWR Fallback（mock reactions + comments） ─────────────────────────────────

const SWR_PREFIX = "dao-dao-server-api";

const reactionsFallbackKey = unstable_serialize([
  SWR_PREFIX,
  "/api/v1/reactions",
  { params: { query: { targetType: "checkin", targetId: MOCK_CHECK_IN_ID } } },
]);

const commentsFallbackKey = unstable_serialize([
  SWR_PREFIX,
  "/api/v1/comments",
  { params: { query: { targetType: "checkin", targetId: MOCK_CHECK_IN_ID } } },
]);

const swrFallback = {
  [reactionsFallbackKey]: {
    data: {
      reactions: [
        { type: "fire", count: 5, latestActorName: "Joy" },
        { type: "useful", count: 3, latestActorName: "Anna" },
      ],
      currentUserReaction: null,
    },
  },
  [commentsFallbackKey]: {
    data: [
      {
        id: 1,
        userId: 101,
        content: "真的 之前大更新之後超驚艷",
        createdAt: "2026-03-31T11:00:00Z",
        user: { id: "u-lin", name: "Lin", photoURL: null, customId: null },
        replies: [],
      },
      {
        id: 2,
        userId: 102,
        content: "線條超自然的！Procreate 內建筆刷真的比外掛好用😍",
        createdAt: "2026-03-31T12:30:00Z",
        user: { id: "u-anna", name: "Anna", photoURL: null, customId: null },
        replies: [
          {
            id: 3,
            userId: 103,
            content: "對！尤其 6B 鉛筆手感超好",
            createdAt: "2026-03-31T13:00:00Z",
            user: { id: "u-wei", name: "小威", photoURL: null, customId: null },
            replies: [],
          },
        ],
      },
    ],
  },
};

// ── Mock 日期列（比照 CheckInDateButton 外觀） ────────────────────────────────

const MOCK_DATES = [
  { hasCheckIn: false, active: false },
  { hasCheckIn: false, active: false },
  { hasCheckIn: false, active: false },
  { hasCheckIn: true,  active: false },
  { hasCheckIn: false, active: false },
  { hasCheckIn: false, active: false },
  { hasCheckIn: false, active: false },
  { hasCheckIn: true,  active: false },
  { hasCheckIn: true,  active: true  }, // 當前選中（03/31）
  { hasCheckIn: false, active: false },
  { hasCheckIn: false, active: false },
];

// ── Mock 日期選擇器頂部列（比照 MobileCheckInDateSelector） ──────────────────

function MockDateSelector() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-[#E9FEFFB2]/70 border-b-2 border-[#E9FEFFB2] rounded-b-3xl backdrop-blur-lg">
      {/* 標題列 */}
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="w-10" />
        <h1 className="text-lg font-medium text-bg-dark">打卡紀錄</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/en/dev/showcase-preview")}
          aria-label="關閉"
          animation="none"
          className="text-light-gray bg-very-light-gray/50"
        >
          <X className="size-6" />
        </Button>
      </div>

      {/* 日期橫向捲動列（比照 CheckInDateButton 外觀） */}
      <div className="overflow-x-auto scrollbar-hide px-10">
        <div className="flex items-center justify-center gap-4 w-fit mx-auto pb-5 pt-4">
          {MOCK_DATES.map((d, i) => {
            const fillOpacity = d.hasCheckIn ? 0.1 : 0;
            return (
              <button
                key={`mock-date-${i}`}
                type="button"
                disabled={!d.hasCheckIn}
                className={cn(
                  "relative size-12 shrink-0 overflow-hidden rounded-full",
                  "bg-white",
                  d.hasCheckIn ? "text-logo-cyan" : "text-logo-cyan/50 cursor-not-allowed",
                  d.active && "ring-2 ring-[#FF9D00] ring-offset-0",
                  "text-base font-medium flex items-center justify-center"
                )}
                style={{
                  background: d.hasCheckIn
                    ? `linear-gradient(to bottom, rgba(255, 157, 0, ${fillOpacity}), rgba(255, 157, 0, ${fillOpacity})), white`
                    : "white",
                }}
              >
                <span className="relative z-10">{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CheckInPreviewPage() {
  const searchParams = useSearchParams();
  const isOwner = searchParams.get("view") !== "other";

  return (
    <SWRConfig value={{ fallback: swrFallback }}>
      <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-logo-cyan">
        <Deco4Svg className="absolute top-0 right-0 -z-10" width={270} height={484} />

        {/* 頂部日期選擇器（mock，比照真實樣式） */}
        <MockDateSelector />

        <main className="max-w-[448px] mx-auto pt-[150px] md:pt-[160px] px-5 pb-52">
          <CheckInDetail
            checkInData={mockCheckIn}
            onEditComplete={isOwner ? async () => {} : undefined}
            isOwner={isOwner}
          />
        </main>
      </div>
    </SWRConfig>
  );
}
