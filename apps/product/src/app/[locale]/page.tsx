"use client";

import { MessagesSvg } from "@daodao/assets";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import {
  AddTaskFAB,
  Banner,
  CheckInSheet,
  type CheckInData,
  CompletedSection,
  DashboardHeader,
  InProgressSection,
  type InProgressTask,
} from "@/components/dashboard";
import { CreatePracticeSheet } from "@/components/create-practice";
import { BackgroundAnimation } from "@/components/layout";

export default function HomePage() {
  // 模擬數據 - 之後可以從 API 取得
  const stats = [
    {
      label: "連續登入",
      value: "34",
      unit: "天",
      icon: CheckCircle2,
    },
    {
      label: "獲得迴響",
      value: "13",
      unit: "次",
      icon: MessagesSvg,
    },
  ];

  const inProgressTasks: InProgressTask[] = [
    {
      id: 4,
      label: "主題實踐",
      title: "學習做甜點學習做甜點學習做甜點學習做甜點",
      description: "看食譜書和 Youtube 教學,每週末做一次",
      progress: "2",
      messagesCount: 17,
      isUnreadMessages: true,
      theme: "yellow",
      status: "draft",
    },
    {
      id: 5,
      label: "主題實踐",
      title: "學習 React Hooks",
      description:
        "每天學習 1.5小時的 React Hooks 課程,包含理論學習、實作練習和筆記整理包含理論學習、實作練習和筆記整理",
      progress: "2",
      messagesCount: 2,
      isUnreadMessages: false,
      theme: "blue",
      status: "in-progress",
    },
    {
      id: 6,
      label: "主題實踐",
      title: "學習 React Hooks",
      description:
        "每天學習 1.5 小時的 React Hooks 課程,包含理論學習、實作練習和筆記整理...",
      progress: "7/14",
      messagesCount: 3,
      isUnreadMessages: true,
      theme: "pink",
      status: "not-started",
    },
    {
      id: 7,
      label: "主題實踐",
      title: "學習 React Hooks",
      description:
        "每天學習 1.5小時的 React Hooks 課程,包含理論學習、實作練習和筆記整理...",
      progress: "10/14",
      messagesCount: 7,
      isUnreadMessages: true,
      theme: "green",
      status: "in-progress",
    },
  ];

  const completedTasks = [
    {
      id: 1,
      label: "主題實踐",
      title: "練習冥想",
      viewCount: 20,
      commentCount: 4,
      tags: ["正念冥想", "Youtube", "放鬆", "專注", "健康"],
    },
    {
      id: 2,
      label: "主題實踐",
      title: "練習冥想",
      viewCount: 20,
      commentCount: 4,
      tags: ["正念冥想", "Youtube", "放鬆", "專注", "健康"],
    },
    {
      id: 3,
      label: "主題實踐",
      title: "練習冥想",
      viewCount: 20,
      commentCount: 4,
      tags: ["正念冥想", "Youtube", "放鬆", "專注", "健康"],
    },
  ];

  const [isCheckInSheetOpen, setIsCheckInSheetOpen] = useState(false);
  const [currentTaskTitle, setCurrentTaskTitle] = useState("");
  const [isCreatePracticeSheetOpen, setIsCreatePracticeSheetOpen] = useState(false);

  const handleCheckIn = (taskTitle: string) => {
    setCurrentTaskTitle(taskTitle);
    setIsCheckInSheetOpen(true);
  };

  const handleCheckInComplete = (data: CheckInData) => {
    // TODO: 處理打卡資料
    console.log("打卡資料:", data);
    setIsCheckInSheetOpen(false);
  };

  const handleAddTask = () => {
    setIsCreatePracticeSheetOpen(true);
  };

  return (
    <div className="relative min-h-screen">
      <Banner />
      <BackgroundAnimation />

      {/* Main Content */}
      <main className="pb-[72px]">
        <DashboardHeader stats={stats} />
        <InProgressSection tasks={inProgressTasks} onCheckIn={handleCheckIn} />
        <CompletedSection tasks={completedTasks} />
      </main>

      <AddTaskFAB onAddTask={handleAddTask} />

      <CheckInSheet
        open={isCheckInSheetOpen}
        onOpenChange={setIsCheckInSheetOpen}
        taskTitle={currentTaskTitle}
        onComplete={handleCheckInComplete}
      />

      <CreatePracticeSheet
        open={isCreatePracticeSheetOpen}
        onOpenChange={setIsCreatePracticeSheetOpen}
      />
    </div>
  );
}
