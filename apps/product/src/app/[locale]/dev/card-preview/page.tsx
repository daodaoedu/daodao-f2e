"use client";

// ============================================================================
// Dev Preview — 所有卡片元件樣式一覽（mock 資料，不需登入）
// ============================================================================

import type { ReactNode } from "react";
import { CompletedTaskCard } from "@/components/dashboard/completed-task-card";
import { ExploreTopicsSection } from "@/components/dashboard/explore-topics-section";
import { InProgressTaskCard } from "@/components/dashboard/in-progress-task-card";
// import { BrewingCard } from "@/components/showcase/BrewingCard";
import { PracticeShowcaseCard } from "@/components/showcase/PracticeShowcaseCard";
import { TaskStatus } from "@/constants/task-status";
import type { IExploreTopicRecommendation } from "@/hooks/use-challenges";

// ── Mock Data ────────────────────────────────────────────────────────────────

const mockUser = {
  id: "user-1",
  name: "Leo Chen",
  photoUrl: null,
};

const mockPracticeShowcase = {
  id: "showcase-1",
  title: "每天早起 5:30，培養晨型人習慣",
  status: "active" as const,
  startDate: "2026-03-01",
  endDate: "2026-05-01",
  user: mockUser,
  actionDescription: "每天 5:30 起床，做 10 分鐘伸展，再寫 15 分鐘晨間日記。",
  frequencyMinDays: 5,
  frequencyMaxDays: 7,
  sessionDurationMinutes: 30,
  commentCount: 12,
};

const mockPracticeCompleted = {
  id: "showcase-2",
  title: "30 天讀完《原子習慣》並實踐",
  status: "completed" as const,
  startDate: "2026-01-01",
  endDate: "2026-01-30",
  user: mockUser,
  actionDescription: "每天閱讀一章，並寫下當天的行動筆記。",
  frequencyMinDays: 6,
  frequencyMaxDays: 7,
  sessionDurationMinutes: 20,
  commentCount: 8,
};

// const mockBrewing = {
//   id: "brewing-1",
//   title: "多益 860 分衝刺計畫",
//   startDate: "2026-05-01",
//   endDate: "2026-07-01",
//   user: mockUser,
//   actionDescription: "每天聽寫一篇 TED Talk，週末做一回模擬考題。",
//   frequencyMinDays: 5,
//   frequencyMaxDays: 7,
//   sessionDurationMinutes: 45,
//   commentCount: 3,
// };

const mockInProgressTask = {
  id: "practice-1",
  label: "個人實踐",
  title: "閱讀《少年臺灣史》",
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
};

const mockCompletedTask = {
  id: "completed-1",
  label: "個人實踐",
  title: "100 天每日冥想挑戰",
  description: "每天早上靜坐 10 分鐘，培養專注力與平靜感。",
  viewCount: 42,
  commentCount: 7,
  tags: ["冥想", "身心健康", "晨型人"],
};

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
  },
  {
    id: "explore-3",
    title: "30 天 Podcast 企劃挑戰",
    description: "從零開始構思、錄音到上架，完成自己的第一個節目。",
    tags: ["Podcast", "創作"],
    reason: "基於您的標籤「Podcast」",
    authorName: "Vic Lin",
    authorAvatarChar: "V",
    authorAvatarColor: "#A78BFA",
  },
];

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-bold text-text-dark border-b border-gray-200 pb-2">{title}</h2>
      {children}
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CardPreviewPage() {
  return (
    <div className="min-h-screen bg-very-light-gray">
      <div className="max-w-[720px] mx-auto px-4 py-10 flex flex-col gap-12">
        <h1 className="text-2xl font-bold text-text-dark">🃏 Card Preview</h1>

        {/* PracticeShowcaseCard */}
        <Section title="PracticeShowcaseCard — active / completed">
          <div className="flex flex-col gap-3">
            <PracticeShowcaseCard {...mockPracticeShowcase} />
            <PracticeShowcaseCard {...mockPracticeCompleted} />
          </div>
        </Section>

        {/* BrewingCard — 暫時隱藏，不在目前開發計劃內 */}
        {/* <Section title="BrewingCard">
          <BrewingCard {...mockBrewing} />
        </Section> */}

        {/* InProgressTaskCard */}
        <Section title="InProgressTaskCard">
          <div className="flex gap-3">
            <InProgressTaskCard {...mockInProgressTask} />
          </div>
        </Section>

        {/* CompletedTaskCard */}
        <Section title="CompletedTaskCard">
          <CompletedTaskCard {...mockCompletedTask} />
        </Section>
      </div>

      {/* ExploreTopicsSection — 全寬 */}
      <Section title="">
        <ExploreTopicsSection topics={mockExploreTopics} />
      </Section>
    </div>
  );
}
