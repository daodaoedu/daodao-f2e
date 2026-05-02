"use client";

import featureHappyJson from "@daodao/assets/images/quiz/feature-happy.json";
import { usePracticeById } from "@daodao/api";
import { useRouter } from "@daodao/i18n/navigation";
import { useEffect } from "react";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { ConfettiAnimation } from "@daodao/ui/components/confetti-animation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { format } from "date-fns";
import Lottie from "lottie-react";
import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { BackgroundAnimation } from "@/components/layout";
import { getStatusConfig, mapPracticeStatusToTaskStatus } from "@/constants/task-status";

export default function CopySuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const practiceId = searchParams.get("practiceId");

  useEffect(() => {
    if (!practiceId) {
      router.replace("/");
    }
  }, [practiceId, router]);

  const { data: practiceResponse } = usePracticeById(practiceId ?? "");
  const practice = practiceResponse?.data;

  if (!practiceId) {
    return null;
  }

  const statusConfig = practice?.status
    ? getStatusConfig(mapPracticeStatusToTaskStatus(practice.status))
    : null;

  const startDate = practice?.startDate ? format(new Date(practice.startDate), "yyyy/MM/dd") : "";

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <BackgroundAnimation />
      <ConfettiAnimation />

      <main className="relative max-w-[600px] mx-auto min-h-screen flex flex-col items-center justify-center px-5 py-12 gap-6">
        {/* 標題 */}
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

        {/* 角色動畫 */}
        <div className="flex items-center justify-center w-full max-w-[375px] h-[275px]">
          <Lottie
            animationData={featureHappyJson}
            className="*:w-full *:h-full"
            loop={true}
            autoplay={true}
          />
        </div>

        {/* Practice info card */}
        {practice && (
          <motion.div
            className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-text-dark leading-snug">{practice.title}</h2>
              {statusConfig && (
                <Badge variant={statusConfig.variant} className="shrink-0">
                  {statusConfig.label}
                </Badge>
              )}
            </div>

            {startDate && (
              <div className="flex gap-2 text-sm">
                <span className="text-gray-400">開始日期</span>
                <span className="text-text-dark font-medium">{startDate}</span>
              </div>
            )}

            {practice.tags && practice.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {practice.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="w-full max-w-sm flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <CustomLink href={`/practices/${practiceId}`}>
            <Button variant="default" className="w-full">
              馬上開始
            </Button>
          </CustomLink>
          <CustomLink href={`/practices/${practiceId}/edit`}>
            <Button variant="outline" className="w-full">
              編輯內容
            </Button>
          </CustomLink>
        </motion.div>
      </main>
    </div>
  );
}
