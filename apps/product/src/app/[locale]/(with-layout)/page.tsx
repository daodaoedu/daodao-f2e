"use client";

import { useMyPracticeStats, useMyPractices } from "@daodao/api";
import { MessagesSvg } from "@daodao/assets";
import { useRouter } from "@daodao/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import {
  AddTaskFAB,
  Banner,
  CompletedSection,
  DashboardHeader,
  InProgressSection,
  RandomPracticesSection,
  type InProgressTask,
} from "@/components/dashboard";
import type { CompletedTask } from "@/components/dashboard/completed-section";
import { BackgroundAnimation } from "@/components/layout";
import { PracticeStatus } from "@/constants/practice-status";
import { getThemeFromId } from "@/constants/practice-theme";
import { TaskStatus } from "@/constants/task-status";

/**
 * 將 API 的 status 映射到 TaskStatus
 */
const mapApiStatusToTaskStatus = (status: PracticeStatus): TaskStatus => {
  if (status === PracticeStatus.active) {
    return TaskStatus.inProgress;
  }
  if (status === PracticeStatus.draft || status === PracticeStatus.notStarted) {
    return TaskStatus.draft;
  }
  if (status === PracticeStatus.completed) {
    return TaskStatus.completed;
  }
  // archived 狀態不應該出現在進行中或已完成列表
  return TaskStatus.draft;
};

export default function HomePage() {
  const router = useRouter();

  // 取得所有實踐（不傳 status 參數，取得所有狀態）
  const { data: allPracticesData, isLoading } = useMyPractices({
    limit: 100, // 增加 limit 以確保取得足夠的數據
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
          theme: getThemeFromId(practice.id),
          status: mapApiStatusToTaskStatus(practice.status),
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
