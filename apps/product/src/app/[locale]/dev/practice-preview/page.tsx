"use client";

// ============================================================================
// Dev Preview — 主題實踐頁面（mock 資料，不需後端）
// ============================================================================

import type { PracticeCheckInsResponse } from "@daodao/api";
import Link from "next/link";
import { X } from "lucide-react";
import { BackgroundAnimation } from "@/components/layout";
import { PracticeDetailShell } from "@/components/practice";
import { DurationDays, ExecutionTiming, Frequency } from "@/constants/practice-form";
import { PracticeStatus } from "@/constants/practice-status";
import type { IComment } from "@/components/check-in/reactions";

const mockPractice = {
  id: "mock-001",
  title: "每天寫 30 分鐘學習筆記",
  status: PracticeStatus.active,
  actionDescription: "用自己的話整理當天學到的一個概念，記錄在筆記本或 Notion 裡",
  frequency: Frequency.fourToSeven,
  durationMinutes: 30,
  durationDays: DurationDays.twentyOne,
  startDate: "2026-03-01",
  executionTiming: [ExecutionTiming.evening],
  customTiming: "",
  tags: ["學習", "筆記", "自我成長"],
  progress: 62,
  creator: {
    id: "mock-user-001",
    name: "陳曉雯",
    photoURL: null,
    date: "2026/03/01",
  },
  resources: [
    {
      id: "res-001",
      name: "Notion 學習筆記模板",
      url: "https://notion.so",
    },
    {
      id: "res-002",
      name: "費曼學習法介紹文章",
    },
  ],
};

const mockCheckInsData = {
  data: [
    {
      id: 1001,
      checkinDate: "2026-03-18",
      mood: "good",
      note: "今天整理了 TypeScript 泛型的概念，寫下來才發現自己其實理解得不夠深，明天繼續補充。",
      imageUrls: [],
      tags: ["TypeScript", "有收穫"],
    },
    {
      id: 1002,
      checkinDate: "2026-03-17",
      mood: "happy",
      note: "複習了 React useCallback 和 useMemo 的差異，豁然開朗！",
      imageUrls: [],
      tags: ["React", "豁然開朗"],
    },
    {
      id: 1003,
      checkinDate: "2026-03-15",
      mood: "neutral",
      note: "今天有點累，只寫了一點點。不過還是有打開筆記本，算是有完成。",
      imageUrls: [],
      tags: ["堅持"],
    },
    {
      id: 1004,
      checkinDate: "2026-03-14",
      mood: "happy",
      note: "整理了 async/await 的錯誤處理模式，搭配 try-catch 和 Promise.allSettled，感覺很實用。",
      imageUrls: [],
      tags: ["JavaScript", "有收穫"],
    },
    {
      id: 1005,
      checkinDate: "2026-03-12",
      mood: "bored",
      note: "今天讀的東西比較枯燥，但還是寫完了。",
      imageUrls: [],
      tags: [],
    },
  ],
} as unknown as PracticeCheckInsResponse;

const mockComments: IComment[] = [
  {
    id: "c001",
    author: {
      name: "王小明",
      photoURL: undefined,
    },
    content: "加油！這個習慣很棒，我也想開始學習筆記！",
    time: "2 天前",
    replies: [
      {
        id: "r001",
        author: {
          name: "陳曉雯",
          photoURL: undefined,
        },
        content: "謝謝你！一起加油 💪",
        time: "2 天前",
      },
      {
        id: "r002",
        author: {
          name: "王小明",
          photoURL: undefined,
        },
        content: "好的！我今天也要開始了！",
        time: "1 天前",
      },
    ],
  },
  {
    id: "c002",
    author: {
      name: "林美華",
      photoURL: undefined,
    },
    content: "費曼學習法真的很有效，繼續堅持！",
    time: "3 天前",
    replies: [
      {
        id: "r003",
        author: {
          name: "陳曉雯",
          photoURL: undefined,
        },
        content: "對啊！把概念用自己的話說出來，真的很有幫助。",
        time: "3 天前",
      },
    ],
  },
];

export default function DevPracticePreviewPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-gray-100">
      <Link
        href="/"
        className="fixed top-2 right-2 z-50 flex items-center justify-center size-10 rounded-full text-light-gray bg-very-light-gray/50 hover:text-logo-cyan"
        aria-label="關閉"
      >
        <X className="size-6" />
      </Link>
      <BackgroundAnimation />
      <PracticeDetailShell
        practice={mockPractice}
        practiceId="mock-001"
        isOwner={false}
        checkInsData={mockCheckInsData}
        isLoadingCheckIns={false}
        isLoadingComments={false}
        comments={mockComments}
        currentUserName="陳曉雯"
        currentUserId="mock-user-001"
        commentCount={2}
        hasPrevious={false}
        hasNext={false}
        onEditPractice={() => {}}
        onArchivePractice={() => {}}
        onDeletePractice={() => {}}
        onSubmitComment={() => {}}
        onEditComment={async () => {}}
        onDeleteComment={async () => {}}
        browseActivity={{
          viewCount: 42,
          followers: [
            { id: "user-joy", name: "Joy", time: "2026/03/20", reaction: "fire" },
            { id: "user-alex", name: "Alex", time: "2026/03/19", reaction: "encourage" },
            { id: "user-sam", name: "Sam", time: "2026/03/18", reaction: "touched" },
            { id: "user-lynn", name: "Lynn", time: "2026/03/17", reaction: "useful" },
          ],
        }}
      />
    </div>
  );
}
