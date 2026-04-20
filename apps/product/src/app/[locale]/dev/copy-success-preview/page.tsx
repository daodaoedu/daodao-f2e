"use client";

// ============================================================================
// Dev Preview — 複製實踐成功頁（mock 資料，不需登入）
// 對應流程：從他人實踐頁點「複製功能」後導到此頁
// ============================================================================

import featureHappyJson from "@daodao/assets/images/quiz/feature-happy.json";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { ConfettiAnimation } from "@daodao/ui/components/confetti-animation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { format } from "date-fns";
import Lottie from "lottie-react";
import { motion } from "motion/react";
import { BackgroundAnimation } from "@/components/layout";
import { TaskStatus, getStatusConfig } from "@/constants/task-status";

const mockCopiedPractice = {
  title: "每天寫 30 分鐘學習筆記",
  startDate: format(new Date(), "yyyy/MM/dd"),
  status: TaskStatus.notStarted,
  tags: ["學習", "筆記", "自我成長"],
};

export default function CopySuccessPreviewPage() {
  const statusConfig = getStatusConfig(mockCopiedPractice.status);

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <BackgroundAnimation />
      <ConfettiAnimation />

      <main className="relative max-w-[600px] mx-auto min-h-screen flex flex-col items-center justify-center px-5 py-12 gap-6">
        {/* 標題區域 */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-medium text-text-dark leading-normal">已複製到你的清單！</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-sm text-text-dark">你可以依照自己的需求調整內容，或直接開始進行。</p>
          </motion.div>
        </div>

        {/* 角色區域 */}
        <div className="flex items-center justify-center w-[375px] h-[275px]">
          <Lottie
            animationData={featureHappyJson}
            className="*:w-full *:h-full"
            loop={true}
            autoplay={true}
          />
        </div>

        {/* Practice info card */}
        <motion.div
          className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-text-dark leading-snug">
              {mockCopiedPractice.title}
            </h2>
            <Badge variant={statusConfig.variant} className="shrink-0">
              {statusConfig.label}
            </Badge>
          </div>

          <div className="flex gap-2 text-sm">
            <span className="text-gray-400">開始日期</span>
            <span className="text-text-dark font-medium">{mockCopiedPractice.startDate}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {mockCopiedPractice.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="w-full max-w-sm flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <CustomLink href="/dev/challenge-preview">
            <Button variant="default" className="w-full">
              馬上開始
            </Button>
          </CustomLink>
          <CustomLink href="/dev/practice-preview">
            <Button variant="outline" className="w-full">
              編輯內容
            </Button>
          </CustomLink>
        </motion.div>
      </main>
    </div>
  );
}
