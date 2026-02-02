"use client";

import { useMyPracticeStats, useMyPractices } from "@daodao/api";
import { MessagesSvg } from "@daodao/assets";
import { useRouter } from "@daodao/i18n/navigation";
import { format, parseISO } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import {
  AddTaskFAB,
  Banner,
  CompletedSection,
  DashboardHeader,
  InProgressSection,
  type InProgressTask,
} from "@/components/dashboard";
import type { CompletedTask } from "@/components/dashboard/completed-section";
import { BackgroundAnimation } from "@/components/layout";
import { RandomPracticesSection } from "@/components/practice";
import { PracticeStatus } from "@/constants/practice-status";
import { mapPracticeStatusToTaskStatus } from "@/constants/task-status";

export default function HomePage() {
  const router = useRouter();

  // 取得所有實踐（不傳 status 參數，取得所有狀態）
  const { data: allPracticesData, isLoading } = useMyPractices({
    limit: 16,
  });

  // 取得統計數據
  const { data: statsData } = useMyPracticeStats();

  // 在前端分類實踐數據
  const { inProgressTasks, completedTasks } = useMemo(() => {
    const practices = allPracticesData?.data || [];
    const inProgressTasksData: InProgressTask[] = [];
    const completedTasksData: CompletedTask[] = [];

    practices.forEach((practice) => {
      const isInProgress =
        practice.status === PracticeStatus.active ||
        practice.status === PracticeStatus.draft ||
        practice.status === PracticeStatus.notStarted;

      // 將 ISO timestamp 轉換為 yyyy-MM-dd 格式
      // API 回傳 lastCheckinAt 為 ISO 8601 格式 (e.g., "2024-01-20T09:00:00.000Z")
      const lastCheckInDate = practice.lastCheckinAt
        ? format(parseISO(practice.lastCheckinAt), "yyyy-MM-dd")
        : null;

      if (isInProgress) {
        inProgressTasksData.push({
          id: practice.id,
          label: "主題實踐",
          title: practice.title,
          description: practice.practiceAction || "",
          checkInCount: practice.checkInCount,
          progress: practice.progressPercentage ?? 0,
          messagesCount: 0, // TODO: 需要從其他 API 取得
          isUnreadMessages: false, // TODO: 需要從其他 API 取得
          theme: practice.themeColor || "#FCDD84",
          status: mapPracticeStatusToTaskStatus(practice.status),
          lastCheckInDate,
        });
      } else if (practice.status === PracticeStatus.completed) {
        completedTasksData.push({
          id: practice.id,
          label: "主題實踐",
          title: practice.title,
          description: practice.practiceAction || "",
          viewCount: 0, // TODO: 需要從其他 API 取得
          commentCount: 0, // TODO: 需要從其他 API 取得
          tags: practice.tags || [],
        });
      }
    });

    return {
      inProgressTasks: inProgressTasksData,
      completedTasks: completedTasksData,
    };
  }, [allPracticesData]);

  // 轉換統計數據
  const stats = useMemo(() => {
    const statsDataValue = statsData?.data;

    return [
      {
        label: "連續登入",
        value: String(statsDataValue?.currentStreak || 0),
        unit: "天",
        icon: CheckCircle2,
      },
      {
        label: "獲得迴響",
        value: String(statsDataValue?.totalCheckIns || 0),
        unit: "次",
        icon: MessagesSvg,
      },
    ];
  }, [statsData]);

  const handleAddTask = () => {
    router.push("/practices/create");
  };

  // 判斷是否有任何實踐資料
  const hasPractices = inProgressTasks.length > 0 || completedTasks.length > 0;

  // Loading 狀態處理
  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <Banner />
        <BackgroundAnimation />
        <main className="pb-[72px]">
          <div className="max-w-[640px] px-5 mx-auto pt-4">
            <div className="text-center text-text-dark">載入中...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Banner />
      <BackgroundAnimation />

      {/* Main Content */}
      <main className="pb-[72px]">
        <DashboardHeader stats={stats} />
        {hasPractices ? (
          <>
            <InProgressSection tasks={inProgressTasks} />
            <CompletedSection tasks={completedTasks} />
          </>
        ) : (
          <RandomPracticesSection />
        )}
      </main>

      <AddTaskFAB onAddTask={handleAddTask} />
    </div>
  );
}
