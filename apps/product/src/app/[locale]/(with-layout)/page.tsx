"use client";

import { useMyPracticeStats, useMyPractices } from "@daodao/api";
import { MessagesSvg } from "@daodao/assets";
import { useRouter } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";

import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  FilterStatus,
  type FilterStatus as FilterStatusType,
  mapPracticeStatusToTaskStatus,
} from "@/constants/task-status";

const filterOptions = [
  { value: FilterStatus.all, label: "全部" },
  { value: FilterStatus.draft, label: "草稿" },
  { value: FilterStatus.notStarted, label: "未開始" },
  { value: FilterStatus.inProgress, label: "進行中" },
  { value: FilterStatus.completed, label: "已完成" },
];

export default function HomePage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>(FilterStatus.all);

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

      // 直接使用 ISO 8601 時間戳，以支援精確的 24 小時冷卻判斷
      const lastCheckInDate = practice.lastCheckinAt ?? null;

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
          startDate: practice.startDate || null,
          endDate: practice.endDate || null,
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

  // 根據篩選狀態過濾進行中的任務
  const filteredInProgressTasks = useMemo(() => {
    if (filterStatus === FilterStatus.all || filterStatus === FilterStatus.completed) {
      return inProgressTasks;
    }
    return inProgressTasks.filter((task) => task.status === filterStatus);
  }, [inProgressTasks, filterStatus]);

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

  // 根據篩選狀態決定顯示哪些區塊
  const showInProgress = filterStatus !== FilterStatus.completed;
  const showCompleted = filterStatus === FilterStatus.all || filterStatus === FilterStatus.completed;

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
            {/* 篩選 Tag */}
            <div className="max-w-[640px] px-5 mx-auto mb-4">
              <div
                role="tablist"
                aria-label="任務篩選"
                className="flex gap-2 overflow-x-auto scrollbar-hide"
              >
                {filterOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    role="tab"
                    aria-selected={filterStatus === option.value}
                    onClick={() => setFilterStatus(option.value)}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm whitespace-nowrap border transition-colors",
                      filterStatus === option.value
                        ? "bg-primary-base border-primary-base text-white"
                        : "bg-white border-primary-base text-primary-base"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {showInProgress && <InProgressSection tasks={filteredInProgressTasks} />}
            {showCompleted && <CompletedSection tasks={completedTasks} />}
          </>
        ) : (
          <RandomPracticesSection />
        )}
      </main>

      <AddTaskFAB onAddTask={handleAddTask} />
    </div>
  );
}
