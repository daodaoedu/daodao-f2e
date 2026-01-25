"use client";

import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { PracticeSection } from "@/components/practice";
import { IslandHeader, UserInfoCard } from "@/components/user";
import { TaskStatus } from "@/constants/task-status";

/**
 * 個人頁面
 * 支援 userId 和 customId 兩種識別符
 *
 * 路由範例：
 * - /users/123 (userId)
 * - /users/john-doe (customId)
 */
export default function UserProfilePage() {
  const userData = {
    name: "John Doe",
    location: "Taiwan",
    selfIntroduction: "I am a software engineer",
    photoURL: "https://example.com/photo.jpg",
  };

  // 模擬資料 - 之後從 API 取得
  const mockLearningType = "我是注重推理的探探島！";
  const mockPractices = [
    {
      id: "1",
      status: TaskStatus.draft,
      title: "閱讀原子習慣",
      description: "點精油,跟着 Youtube 教學做",
      tags: ["閱讀", "原子習慣", "心理學"],
    },
    {
      id: "2",
      status: TaskStatus.inProgress,
      title: "閱讀原子習慣",
      description: "點精油,跟着 Youtube 教學做",
      tags: ["閱讀", "原子習慣"],
    },
  ];

  const handleRetakeQuiz = () => {
    // TODO: 導航到測驗頁面
    console.log("重新測驗");
  };

  const handleViewDetails = () => {
    // TODO: 顯示詳細說明
    console.log("觀看詳細說明");
  };

  // 模擬社群媒體連結 - 之後從 API 取得
  const mockSocialLinks = [
    { platform: "line" as const, url: "https://line.me/ti/p/@example" },
    { platform: "facebook" as const, url: "https://facebook.com/example" },
    { platform: "instagram" as const, url: "https://instagram.com/example" },
  ];

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-[#B8E8FD]">
      <IslandHeader
        learningType={mockLearningType}
        onRetakeQuiz={handleRetakeQuiz}
        onViewDetails={handleViewDetails}
      >
        <PageHeader
          title="我的小島"
          rightActionTo="/settings"
          rightLabel="設定"
          rightActionIcon={<SlidersHorizontal className="size-6" />}
        />
      </IslandHeader>

      <main className="max-w-[640px] mx-auto px-5 pb-[64px]">
        {/* 用戶個人資訊卡片 */}
        <UserInfoCard
          name={userData.name || "未命名用戶"}
          location={userData.location || undefined}
          selfIntroduction={userData.selfIntroduction || undefined}
          photoURL={userData.photoURL || undefined}
          socialLinks={mockSocialLinks}
        />

        {/* 「主題實踐」區塊 */}
        <PracticeSection practices={mockPractices} />
      </main>
    </div>
  );
}
