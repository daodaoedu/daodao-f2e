"use client";

import { useCallback } from "react";
import { useRouter } from "@daodao/i18n/navigation";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import {
  ExecutionDurationCard,
  ExecutionTimingCard,
  PracticeDetailTitle,
  PracticeOverviewCard,
} from "@/components/practice";
import { CheckInRecordCard, CheckInStack } from "@/components/check-in";
import { ReactionBar, ViewAllCommentsButton } from "@/components/check-in/reactions";
import type { IReactionCount } from "@/components/check-in/reactions";
import { ExecutionTiming, Frequency, DurationDays } from "@/constants/practice-form";
import { PracticeStatus } from "@/constants/practice-status";
import { ReactionType, type ReactionTypeType } from "@/constants/reaction-type";

// ============================================================================
// Mock Data — 模擬「Enn 正在瀏覽 Vincent 的實踐」
// ============================================================================

export const MOCK_PRACTICE = {
  name: "練習寫小說",
  status: PracticeStatus.active,
  actionDescription: "每天至少寫 500 字，可以是正文、人物設定或場景描述，不求完美只求持續",
  frequency: Frequency.twoToFour,
  durationMinutes: 30,
  durationDays: DurationDays.twentyOne,
  startDate: "2026-02-10",
  executionTiming: [ExecutionTiming.morning],
  tags: ["寫作", "創意", "小說"],
  creator: {
    id: "vincent-mock-id",
    name: "Vincent",
    photoURL: undefined,
    date: "2026/02/10",
  },
};

// 符合 PracticeCheckInsResponse 格式的 mock 打卡資料
export const MOCK_CHECK_INS_DATA = {
  success: true as const,
  data: [
    { id: 1, practiceId: 1, userId: 2, checkinDate: "2026-02-22", mood: "happy" as const, note: "今天終於把卡了兩週的情節寫出來了！雖然只有 800 字，但感覺突破了一個關卡。", imageUrls: [], ogImageUrl: null, tags: ["寫作", "突破"], createdAt: "2026-02-22T10:00:00.000Z" },
    { id: 2, practiceId: 1, userId: 2, checkinDate: "2026-02-20", mood: "neutral" as const, note: "今天狀態不太好，只寫了 300 字，但還是有寫就好。", imageUrls: [], ogImageUrl: null, tags: ["堅持"], createdAt: "2026-02-20T10:00:00.000Z" },
    { id: 3, practiceId: 1, userId: 2, checkinDate: "2026-02-18", mood: "happy" as const, note: "靈感大爆發！一口氣寫了 1500 字，角色的背景故事越來越清晰了。", imageUrls: [], ogImageUrl: null, tags: ["靈感", "寫作"], createdAt: "2026-02-18T10:00:00.000Z" },
    { id: 4, practiceId: 1, userId: 2, checkinDate: "2026-02-16", mood: "good" as const, note: "今天練習了對話節奏，讀了一些參考書，有新的靈感。", imageUrls: [], ogImageUrl: null, tags: ["學習", "寫作"], createdAt: "2026-02-16T10:00:00.000Z" },
    { id: 5, practiceId: 1, userId: 2, checkinDate: "2026-02-14", mood: "frustrated" as const, note: "今天寫的內容感覺很差，但還是逼自己完成了 500 字。", imageUrls: [], ogImageUrl: null, tags: ["堅持"], createdAt: "2026-02-14T10:00:00.000Z" },
    { id: 6, practiceId: 1, userId: 2, checkinDate: "2026-02-12", mood: "good" as const, note: "重新規劃了故事大綱，感覺走向更清晰了。", imageUrls: [], ogImageUrl: null, tags: ["計畫", "寫作"], createdAt: "2026-02-12T10:00:00.000Z" },
  ],
  pagination: { currentPage: 1, totalPages: 1, totalItems: 6, itemsPerPage: 30, hasNext: false, hasPrev: false },
  timestamp: "2026-02-24T00:00:00.000Z",
};

export const MOCK_INITIAL_REACTIONS: IReactionCount[] = [
  { type: ReactionType.encourage, count: 3, latestActorName: "Sarah" },
  { type: ReactionType.fire,      count: 1, latestActorName: "Alex" },
  { type: ReactionType.sameHere,  count: 2, latestActorName: "Jordan" },
  { type: ReactionType.touched,   count: 0 },
  { type: ReactionType.useful,    count: 0 },
  { type: ReactionType.curious,   count: 0 },
];

export const TOTAL_COMMENT_COUNT = 3;

// ============================================================================
// Page
// ============================================================================

export default function ReactDemoPage() {
  const router = useRouter();

  // On the main page, clicking a reaction navigates directly to the comments page
  // with the reaction pre-selected so the comment input is pre-filled.
  const handleReactionClick = useCallback((type: ReactionTypeType) => {
    router.push(`/react-demo/comments?reaction=${type}`);
  }, [router]);

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <PageHeader leftAction="back" leftLabel="" title="主題實踐" rightActionTo="/" />
      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-10">
        <p className="text-xs text-text-dark/40 text-center pt-2 pb-1">
          [Prototype] 快速回應與留言
        </p>

        <PracticeDetailTitle
          title={MOCK_PRACTICE.name}
          status={MOCK_PRACTICE.status}
          onPrevious={() => {}}
          onNext={() => {}}
          hasPrevious={false}
          hasNext={false}
        />

        <p className="text-base font-medium text-text-dark mb-4">執行方式</p>

        <PracticeOverviewCard
          actionDescription={MOCK_PRACTICE.actionDescription}
          frequency={MOCK_PRACTICE.frequency}
          durationMinutes={MOCK_PRACTICE.durationMinutes}
          tags={MOCK_PRACTICE.tags}
          progress={62}
          showProgress
          creator={MOCK_PRACTICE.creator}
        />

        <div className="grid grid-cols-2 gap-4 mb-6">
          <ExecutionTimingCard executionTiming={MOCK_PRACTICE.executionTiming} />
          <ExecutionDurationCard
            durationDays={MOCK_PRACTICE.durationDays}
            startDate={MOCK_PRACTICE.startDate}
            showRemaining
          />
        </div>

        {/* ── 留言迴響（快速回應）── */}
        <p className="text-base font-medium text-text-dark mb-3">留言迴響</p>
        <div className="bg-white rounded-lg shadow-sm mb-6">
          {/* Reaction Buttons — 水平滑動 */}
          <ReactionBar
            reactions={MOCK_INITIAL_REACTIONS}
            selectedReactions={[]}
            onReactionClick={handleReactionClick}
            className="overflow-x-auto flex-nowrap scrollbar-none"
          />

          {/* 全部留言 按鈕 */}
          <div className="px-4 pb-4">
            <ViewAllCommentsButton
              commentCount={TOTAL_COMMENT_COUNT}
              onClick={() => router.push("/react-demo/comments")}
            />
          </div>
        </div>

        {/* ── 打卡紀錄 ── */}
        <CheckInRecordCard checkInsData={MOCK_CHECK_INS_DATA} />
      </main>

      {/* 打卡堆疊 */}
      <div className="max-w-[448px] mx-auto pb-24">
        <CheckInStack practiceId="react-demo" checkInsData={MOCK_CHECK_INS_DATA} />
      </div>
    </div>
  );
}
