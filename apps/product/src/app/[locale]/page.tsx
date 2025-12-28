"use client";

import { BannerSvg, intersectMaskDataUri, MessagesSvg } from "@daodao/assets";
import activeShaper2Json from "@daodao/assets/images/quiz/active-shaper-2.json";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { format } from "date-fns";
import Lottie from "lottie-react";
import { CheckCircle2, Plus } from "lucide-react";
import { CompletedTaskCard, InProgressTaskCard, StatCard } from "@/components/dashboard";
import { Footer, Sidebar } from "@/components/layout";

export default function HomePage() {
  // 格式化日期顯示
  const today = new Date();

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

  const inProgressTasks = [
    {
      id: 4,
      label: "主題實踐",
      title: "學習做甜點學習做甜點學習做甜點學習做甜點",
      description: "看食譜書和 Youtube 教學,每週末做一次",
      progress: "2",
      messagesCount: 17,
      isUnreadMessages: true,
      theme: "yellow",
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
    },
    {
      id: 6,
      label: "主題實踐",
      title: "學習 React Hooks",
      description: "每天學習 1.5 小時的 React Hooks 課程,包含理論學習、實作練習和筆記整理...",
      progress: "7/14",
      messagesCount: 3,
      isUnreadMessages: true,
      theme: "pink",
    },
    {
      id: 7,
      label: "主題實踐",
      title: "學習 React Hooks",
      description: "每天學習 1.5小時的 React Hooks 課程,包含理論學習、實作練習和筆記整理...",
      progress: "10/14",
      messagesCount: 7,
      isUnreadMessages: true,
      theme: "green",
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

  const handleCheckIn = (taskTitle: string) => {
    // TODO: 實作打卡功能
    console.log("打卡:", taskTitle);
  };

  const handleAddTask = () => {
    // TODO: 實作新增任務功能
    console.log("新增任務");
  };

  return (
    <div className="min-h-screen bg-very-light-gray">
      <Sidebar />

      <header
        className="fixed top-0 right-0 left-0 z-20 pointer-events-none mask-luminance"
        style={{ maskImage: `url("${intersectMaskDataUri}")` }}
      >
        <BannerSvg className="w-full" />
        <h1
          className={cn(
            "absolute top-[calc(3/13*100%)] left-1/2 -translate-x-1/2 -translate-y-full",
            "text-[1.75rem] text-text-dark font-medium pointer-events-auto"
          )}
        >
          我的小島
        </h1>
        <h2
          className={cn(
            "absolute top-[calc(3/7*100%)] left-1/2 -translate-x-1/2 -translate-y-full max-w-[540px] w-full h-10",
            "flex items-center justify-center pointer-events-auto",
            "text-[1.125rem] bg-white/70 rounded-full text-text-dark border border-white"
          )}
        >
          先做再說，做中學最快！
          <div className="absolute top-4 -right-[27px] size-4.5 rounded-full bg-white/70 border border-white">
            <div className="absolute -bottom-[11px] -right-3 w-3 h-[11px] rounded-full bg-white/70 border border-white">
              <div className="absolute -bottom-7 left-full w-32 rotate-3">
                <Lottie animationData={activeShaper2Json} className="*:w-full *:h-full" />
              </div>
            </div>
          </div>
        </h2>
      </header>

      <div className="aspect-16/3" />

      {/* Main Content */}
      <main className="max-w-[600px] mx-auto pb-[72px]">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-10">
            <time className="block mb-3">
              <div className="text-[1.375rem] text-light-gray">{format(today, "yyyy")}</div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1">
                  <span className="text-4xl text-text-dark font-semibold">
                    {format(today, "M")}
                  </span>
                  <span className="mt-1 text-[1.375rem] text-text-dark font-medium">月</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-4xl text-text-dark font-semibold">
                    {format(today, "d")}
                  </span>
                  <span className="mt-1 text-[1.375rem] text-text-dark font-medium">日</span>
                </span>
              </div>
            </time>
            <div className="flex gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="flex-1">
                  <StatCard
                    label={stat.label}
                    value={stat.value}
                    unit={stat.unit}
                    icon={stat.icon}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Section */}
          <section className="mb-6">
            <h2 className="mb-3 text-[1.125rem] font-medium text-bg-dark">進行中</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {inProgressTasks.map((task) => (
                <InProgressTaskCard
                  key={task.id}
                  label={task.label}
                  title={task.title}
                  description={task.description}
                  progress={task.progress}
                  messagesCount={task.messagesCount}
                  theme={task.theme}
                  isUnreadMessages={task.isUnreadMessages}
                  onCheckIn={() => handleCheckIn(task.title)}
                />
              ))}
            </div>
          </section>

          {/* Completed Section */}
          <section>
            <h2 className="mb-3 text-[1.125rem] font-medium text-bg-dark">已完成</h2>
            <div className="flex flex-col gap-3">
              {completedTasks.map((task) => (
                <CompletedTaskCard
                  key={task.id}
                  label={task.label}
                  title={task.title}
                  viewCount={task.viewCount}
                  commentCount={task.commentCount}
                  tags={task.tags}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Floating Action Button */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-8 right-8 size-14 rounded-full shadow-lg"
        onClick={handleAddTask}
        aria-label="新增任務"
      >
        <Plus className="size-6" />
      </Button>
      <Footer />
    </div>
  );
}
