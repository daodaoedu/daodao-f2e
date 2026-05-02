"use client";

// ============================================================================
// Dev Preview — 靈感頁面 Feed 排版預覽（mock 資料，不需後端）
// ============================================================================

import type { BatchReactionItem } from "@daodao/api";
import { cn } from "@daodao/ui/lib/utils";
import { Rss, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { AddTaskFAB } from "@/components/dashboard";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { DesktopSidebar } from "@/components/layout/sidebar/desktop";
import { MobileSidebar } from "@/components/layout/sidebar/mobile";
import { CheckInShowcaseCard } from "@/components/showcase/CheckInShowcaseCard";
import { PracticeShowcaseCard } from "@/components/showcase/PracticeShowcaseCard";
import { ShowcaseSearchBar } from "@/components/showcase/ShowcaseSearchBar";

// ── Mock Reaction 資料 ────────────────────────────────────────────────────────

const mockReactions1: BatchReactionItem = {
  reactions: [
    { type: "useful", count: 5, latestActorName: "Lin" },
    { type: "fire", count: 2, latestActorName: null },
  ],
  currentUserReaction: null,
  items: [
    {
      userId: "u-lin",
      name: "Lin",
      photoURL: null,
      reactionType: "useful",
      reactedAt: "2026-03-31T10:00:00Z",
      isPublic: true,
      isConnection: false,
    },
    {
      userId: "u-anna",
      name: "Anna",
      photoURL: null,
      reactionType: "fire",
      reactedAt: "2026-03-31T10:01:00Z",
      isPublic: true,
      isConnection: false,
    },
  ],
};

const mockReactions2: BatchReactionItem = {
  reactions: [
    { type: "useful", count: 8, latestActorName: "Anna" },
    { type: "touched", count: 3, latestActorName: null },
  ],
  currentUserReaction: "useful",
  items: [
    {
      userId: "u-anna",
      name: "Anna",
      photoURL: null,
      reactionType: "useful",
      reactedAt: "2026-03-30T10:00:00Z",
      isPublic: true,
      isConnection: false,
    },
    {
      userId: "u-wei",
      name: "小威",
      photoURL: null,
      reactionType: "touched",
      reactedAt: "2026-03-30T10:01:00Z",
      isPublic: true,
      isConnection: false,
    },
  ],
};

// ── Feed Label ────────────────────────────────────────────────────────────────

function CalendarCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M20.25 10.75H3.75V20C3.75 20.6904 4.30964 21.25 5 21.25H19C19.6904 21.25 20.25 20.6904 20.25 20V10.75ZM14.4697 13.4697C14.7626 13.1768 15.2374 13.1768 15.5303 13.4697C15.8232 13.7626 15.8232 14.2374 15.5303 14.5303L11.5303 18.5303C11.2374 18.8232 10.7626 18.8232 10.4697 18.5303L8.46973 16.5303C8.17683 16.2374 8.17683 15.7626 8.46973 15.4697C8.76262 15.1768 9.23738 15.1768 9.53027 15.4697L11 16.9395L14.4697 13.4697ZM15.25 6V4.75H8.75V6C8.75 6.41421 8.41421 6.75 8 6.75C7.58579 6.75 7.25 6.41421 7.25 6V4.75H5C4.30964 4.75 3.75 5.30964 3.75 6V9.25H20.25V6C20.25 5.30964 19.6904 4.75 19 4.75H16.75V6C16.75 6.41421 16.4142 6.75 16 6.75C15.5858 6.75 15.25 6.41421 15.25 6ZM21.75 20C21.75 21.5188 20.5188 22.75 19 22.75H5C3.48122 22.75 2.25 21.5188 2.25 20V6C2.25 4.48122 3.48122 3.25 5 3.25H7.25V2C7.25 1.58579 7.58579 1.25 8 1.25C8.41421 1.25 8.75 1.58579 8.75 2V3.25H15.25V2C15.25 1.58579 15.5858 1.25 16 1.25C16.4142 1.25 16.75 1.58579 16.75 2V3.25H19C20.5188 3.25 21.75 4.48122 21.75 6V20Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FeedLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-text-dark px-1 mb-4">
      {icon}
      <span>{text}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

type TabType = "inspire" | "mine";

export default function ShowcasePreviewPage() {
  const [activeTab, setActiveTab] = useState<TabType>("inspire");
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="relative min-h-screen">
      <Banner />
      <BackgroundAnimation />

      <main className="relative z-[25] pb-[72px] md:pl-44 bg-very-light-gray">
        <div className="max-w-[640px] px-4 mx-auto pt-4">
          {/* Tab Switcher */}
          <div className="flex border-b border-[#E5E7EB]" style={{ marginBottom: "40px" }}>
            <button
              type="button"
              onClick={() => setActiveTab("inspire")}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all",
                activeTab === "inspire"
                  ? "text-text-dark border-b-2 border-logo-cyan -mb-px"
                  : "text-text-dark/40"
              )}
            >
              靈感
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("mine")}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all",
                activeTab === "mine"
                  ? "text-text-dark border-b-2 border-logo-cyan -mb-px"
                  : "text-text-dark/40"
              )}
            >
              我的
            </button>
          </div>

          {/* 靈感 Tab */}
          {activeTab === "inspire" && (
            <>
              <div style={{ marginBottom: "40px" }}>
                <ShowcaseSearchBar
                  value={searchValue}
                  onChange={setSearchValue}
                  onSearch={setSearchValue}
                />
              </div>

              <div className="flex flex-col gap-10">
                {/* Item 1: 實踐卡片（cheered） */}
                <div>
                  <FeedLabel icon={<ThumbsUp className="size-3.5" />} text="Lin 表達了加油" />
                  <PracticeShowcaseCard
                    id="mock-practice-1"
                    title="學習 Vibe Coding：用 AI 輔助開發一個專案"
                    status="active"
                    startDate="2026-03-23"
                    endDate="2026-03-23"
                    user={{ id: "u1", name: "Joy", photoUrl: null }}
                    actionDescription="指配 Gemini，看 30 天線上教學、實際做一個專案。"
                    frequencyMinDays={3}
                    frequencyMaxDays={5}
                    sessionDurationMinutes={30}
                    commentCount={3}
                    batchReactionData={mockReactions1}
                  />
                </div>

                {/* Item 2: 打卡卡片（無照片，checked_in） */}
                <div>
                  <FeedLabel
                    icon={<CalendarCheckIcon />}
                    text="Lin 在 Procreate 小物繪畫練習 打卡"
                  />
                  <CheckInShowcaseCard
                    id="mock-checkin-1"
                    checkin_date="2026/03/31"
                    mood="happy"
                    note="雖然網路上很多免費筆刷可以下載，但 Procreate 內建的筆刷就很夠用了"
                    tags={["Procreate", "數位繪圖"]}
                    image_urls={[]}
                    created_at="2026-03-31T10:00:00Z"
                    practice={{ id: "mock-practice-2", title: "Procreate 小物繪畫練習" }}
                    user={{ id: "u1", name: "Joy", photo_url: null }}
                    comment_count={12}
                    batchReactionData={mockReactions2}
                    comment_preview={[
                      {
                        id: "c1",
                        content: "真的 之前大更新之後超驚艷",
                        user: { id: "u2", name: "小明", photo_url: null },
                        created_at: "2026-03-31T11:00:00Z",
                      },
                    ]}
                  />
                </div>

                {/* Item 3: 打卡卡片（有照片，checked_in） */}
                <div>
                  <FeedLabel
                    icon={<CalendarCheckIcon />}
                    text="Anna 在 每天寫 30 分鐘學習筆記 打卡"
                  />
                  <CheckInShowcaseCard
                    id="mock-checkin-2"
                    checkin_date="2026/03/30"
                    mood="good"
                    note="今天複習了 React useCallback 和 useMemo 的差異，豁然開朗！之前一直搞混，現在終於清楚了。"
                    tags={["React", "豁然開朗"]}
                    image_urls={["https://placehold.co/600x400/C3EEFF/333333?text=Note+Screenshot"]}
                    created_at="2026-03-30T10:00:00Z"
                    practice={{ id: "mock-practice-3", title: "每天寫 30 分鐘學習筆記" }}
                    user={{ id: "u3", name: "Anna", photo_url: null }}
                    comment_count={2}
                    batchReactionData={mockReactions1}
                    comment_preview={[
                      {
                        id: "c2",
                        content: "這邊我也常搞不清楚",
                        user: { id: "u4", name: "Vanessa", photo_url: null },
                        created_at: "2026-03-30T12:00:00Z",
                      },
                    ]}
                  />
                </div>

                {/* Item 4–6: 最新發布群組（new_release，共用一個 FeedLabel） */}
                <div className="flex flex-col gap-5">
                  <FeedLabel icon={<Rss className="size-3.5" />} text="最新發布" />
                  <PracticeShowcaseCard
                    id="mock-practice-4"
                    title="每天閱讀 30 分鐘：培養閱讀習慣，拓展知識邊界"
                    status="active"
                    startDate="2026-03-23"
                    endDate="2026-06-23"
                    user={{ id: "u4", name: "小威", photoUrl: null }}
                    actionDescription="每天睡前閱讀 30 分鐘，記錄當天的心得與收穫。"
                    frequencyMinDays={1}
                    frequencyMaxDays={1}
                    sessionDurationMinutes={30}
                    commentCount={0}
                  />
                  <PracticeShowcaseCard
                    id="mock-practice-5"
                    title="連續 60 天早起：用晨間時光打造高效一天"
                    status="active"
                    startDate="2026-04-01"
                    endDate="2026-05-30"
                    user={{ id: "u5", name: "Chloe", photoUrl: null }}
                    actionDescription="每天 6:30 前起床，完成 10 分鐘冥想 + 寫當日三件感恩的事。"
                    frequencyMinDays={1}
                    frequencyMaxDays={1}
                    sessionDurationMinutes={20}
                    commentCount={1}
                  />
                  <PracticeShowcaseCard
                    id="mock-practice-6"
                    title="學西班牙文：每天用 Duolingo 練習 15 分鐘"
                    status="active"
                    startDate="2026-03-10"
                    endDate="2026-09-10"
                    user={{ id: "u6", name: "Marcus", photoUrl: null }}
                    actionDescription="用 Duolingo 搭配 YouTube 西語頻道，目標六個月後能對話。"
                    frequencyMinDays={1}
                    frequencyMaxDays={1}
                    sessionDurationMinutes={15}
                    commentCount={4}
                  />
                </div>
              </div>
            </>
          )}

          {/* 我的 Tab（預留） */}
          {activeTab === "mine" && (
            <div className="text-center text-text-dark/40 py-12 text-sm">
              （我的 tab — dev preview 僅模擬靈感頁）
            </div>
          )}
        </div>
      </main>

      <div className="md:hidden">
        <MobileSidebar identifier="preview" />
      </div>
      <div className="hidden md:block">
        <DesktopSidebar identifier="preview" />
      </div>

      <AddTaskFAB />
    </div>
  );
}
