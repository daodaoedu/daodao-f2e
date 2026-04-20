"use client";

// ============================================================================
// Dev Preview — 「我的」Tab 個人實踐卡 + 探索相關主題（mock 資料，不需登入）
// ============================================================================

import { ExploreTopicsSection } from "@/components/dashboard/explore-topics-section";
import { InProgressTaskCard } from "@/components/dashboard/in-progress-task-card";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { TaskStatus } from "@/constants/task-status";
import type { IExploreTopicRecommendation } from "@/hooks/use-challenges";

// ── Mock Data ────────────────────────────────────────────────────────────────

const mockInProgressTasks = [
  {
    id: "practice-1",
    label: "個人實踐",
    title: "閱讀 [少年臺灣史]",
    description: "每週至少看三天，並記錄想法",
    checkInCount: 5,
    progress: 35,
    messagesCount: 0,
    isUnreadMessages: false,
    theme: "#FCDD84",
    status: TaskStatus.inProgress,
    lastCheckInDate: null,
    startDate: "2026-04-01",
    endDate: "2026-05-21",
  },
];

const mockExploreTopics: IExploreTopicRecommendation[] = [
  {
    id: "explore-1",
    title: "多益 860 分衝刺計畫",
    description: "每天聽寫一篇 TED Talk，週末做一回模擬考題。",
    tags: ["英文", "檢定", "聽力"],
    reason: "因為您正在「練習日文」",
    authorName: "Leo Chen",
    authorAvatarChar: "L",
    authorAvatarColor: "#16B9B3",
    practiceId: "dev-preview",
  },
  {
    id: "explore-2",
    title: "每週讀透一本書",
    description: "涵蓋歷史、科技與心理學，並產出心智圖筆記。",
    tags: ["閱讀", "自我成長"],
    reason: "與您「閱讀少年臺灣史」的興趣相近",
    authorName: "Kay Wu",
    authorAvatarChar: "K",
    authorAvatarColor: "#16B9B3",
    practiceId: "dev-preview",
  },
  {
    id: "explore-3",
    title: "30 天 Podcast 企劃挑戰",
    description: "從零開始構思、錄音到上架，完成自己的第一個節目。",
    tags: ["Podcast", "創作"],
    reason: "基於您的標籤「Podcast」",
    authorName: "Vic Lin",
    authorAvatarChar: "V",
    authorAvatarColor: "#16B9B3",
    practiceId: "dev-preview",
  },
  {
    id: "explore-4",
    title: "晨間冥想 21 天計畫",
    description: "每天早起 10 分鐘靜坐，培養專注力與平靜感，讓一天從清醒開始。",
    tags: ["冥想", "身心健康", "晨型人"],
    reason: "與您的習慣養成目標相關",
    authorName: "Mia Park",
    authorAvatarChar: "M",
    authorAvatarColor: "#A78BFA",
    practiceId: "dev-preview",
  },
];

const filterOptions = ["全部", "草稿", "未開始", "進行中", "已完成"];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ChallengePreviewPage() {
  return (
    <div className="relative min-h-screen">
      <Banner />
      <BackgroundAnimation />

      <main className="relative z-[25] pb-[72px] bg-very-light-gray">
        <div className="max-w-[640px] px-4 mx-auto pt-4">
          {/* Tab bar */}
          <div className="flex border-b border-[#E5E7EB] mb-4">
            <button
              type="button"
              className="flex-1 py-2 text-sm font-medium text-text-dark/40 cursor-pointer hover:text-text-dark/70 transition-colors"
            >
              靈感
            </button>
            <button
              type="button"
              className="flex-1 py-2 text-sm font-medium text-text-dark border-b-2 border-logo-cyan -mb-px cursor-pointer hover:text-primary-base transition-colors"
            >
              我的
            </button>
          </div>

          {/* Filter pills */}
          <div className="mt-[48px] mb-[40px] flex gap-2 overflow-x-auto scrollbar-hide">
            {filterOptions.map((label, i) => (
              <button
                key={label}
                type="button"
                className={`px-5 py-2 rounded-full text-sm whitespace-nowrap border transition-colors cursor-pointer ${
                  i === 0
                    ? "bg-primary-base border-primary-base text-white hover:bg-primary-darker"
                    : "bg-white border-primary-base text-primary-base hover:bg-primary-palest"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 個人實踐卡 — mobile 橫向捲動，desktop 雙欄 grid */}
          <div className="flex overflow-auto *:shrink-0 gap-3 scrollbar-hide mb-6 md:grid md:grid-cols-2 md:overflow-visible">
            {mockInProgressTasks.map((task) => (
              <InProgressTaskCard
                key={task.id}
                id={task.id}
                label={task.label}
                title={task.title}
                description={task.description}
                checkInCount={task.checkInCount}
                progress={task.progress}
                messagesCount={task.messagesCount}
                isUnreadMessages={task.isUnreadMessages}
                theme={task.theme}
                status={task.status}
                lastCheckInDate={task.lastCheckInDate}
                startDate={task.startDate}
                endDate={task.endDate}
              />
            ))}
          </div>
        </div>

        {/* 探索相關主題 — 全寬，不受 max-w-[640px] 限制 */}
        <ExploreTopicsSection topics={mockExploreTopics} />
      </main>
    </div>
  );
}
