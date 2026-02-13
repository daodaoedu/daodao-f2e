"use client";

import type { MoodType, PracticeSummary } from "@daodao/api";
import {
  ArrowRightOutlineSvg,
  BoredSvg,
  FacebookFilledSvg,
  FineSvg,
  FrustratedSvg,
  HappySvg,
  HopelessSvg,
  LineFilledSvg,
  LinkedinFilledSvg,
  NeutralSvg,
  ThreadsFilledSvg,
  VerifiedSvg,
  XFilledSvg,
} from "@daodao/assets";
import { useRouter } from "@daodao/i18n/navigation";
import { getShareAPI } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { ConfettiAnimation } from "@daodao/ui/components/confetti-animation";
import { Download, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType } from "react";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { usePracticeSummaryImage } from "./hooks";
import { PracticeSummaryCard } from "./practice-summary-card";

interface PracticeSummaryPageProps {
  summary: PracticeSummary;
  practiceId: string;
}

/**
 * 心情類型對應的 SVG 組件
 */
const MoodIconMap: Record<MoodType, ComponentType<{ className?: string }>> = {
  give_up: HopelessSvg,
  frustrated: FrustratedSvg,
  bored: BoredSvg,
  neutral: NeutralSvg,
  good: FineSvg,
  happy: HappySvg,
};

/**
 * 實踐完成總結頁面元件
 * @description 顯示實踐完成的慶祝頁面、摘要圖片和分享功能
 */
export function PracticeSummaryPage({ summary, practiceId: _practiceId }: PracticeSummaryPageProps) {
  const router = useRouter();

  // 使用摘要圖片生成 hook
  const {
    summaryCardRef,
    isGenerating,
    downloadImage,
  } = usePracticeSummaryImage({
    practiceName: summary.practiceName,
  });

  const handleBackToHome = () => {
    router.push("/");
  };

  // 準備分享內容
  const shareText = `我完成了「${summary.practiceName}」的實踐旅程！\n留下了 ${summary.checkInCount} 個成長足跡`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareAPI = getShareAPI({
    title: `${summary.userName} 完成了主題實踐`,
    text: shareText,
    url: shareUrl,
    hashtag: "#島島阿學 #主題實踐",
  });

  // 處理下載圖片
  const handleDownloadImage = async () => {
    await downloadImage();
  };

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <PageHeader leftAction="back" leftLabel="" title="" rightActionTo="/" />

      <BackgroundAnimation />

      {/* 撒花動畫 */}
      <ConfettiAnimation />

      <main className="relative max-w-[448px] mx-auto px-5 pb-24">
        {/* 慶祝區塊 */}
        <section className="text-center py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl font-bold text-text-dark mb-2">實踐完成</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-text-dark mb-4">你完成了一個尋找可能性的旅程</p>
          </motion.div>

          {/* 慶祝人物插圖 */}
          <motion.div
            className="flex justify-center my-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <VerifiedSvg className="w-[300px] h-[220px]" />
          </motion.div>

          {/* 鼓勵文字 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="font-inter text-sm font-normal text-text-dark text-center leading-loose">{summary.encouragementText}</p>
            <p className="font-inter text-sm font-normal text-text-dark text-center leading-loose mt-1">以下是這趟旅程的總結</p>
          </motion.div>
        </section>

        {/* 摘要圖片預覽區塊 */}
        <motion.section
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div ref={summaryCardRef}>
            <PracticeSummaryCard summary={summary} />
          </div>
        </motion.section>

        {/* 分享功能區塊 */}
        <motion.section
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-base font-medium text-text-dark text-center mb-4">
            分享到社群媒體
          </h3>
          <div className="flex justify-center gap-4 mb-4">
            <Button
              type="button"
              variant="link"
              size="icon"
              onClick={shareAPI.lineShare}
              aria-label="分享到 LINE"
            >
              <LineFilledSvg className="size-10" />
            </Button>
            <Button
              type="button"
              variant="link"
              size="icon"
              onClick={shareAPI.threadsShare}
              aria-label="分享到 Threads"
            >
              <ThreadsFilledSvg className="size-10 text-logo-purple" />
            </Button>
            <Button
              type="button"
              variant="link"
              size="icon"
              onClick={shareAPI.facebookShare}
              aria-label="分享到 Facebook"
            >
              <FacebookFilledSvg className="size-10 text-logo-blue" />
            </Button>
            <Button
              type="button"
              variant="link"
              size="icon"
              onClick={shareAPI.xShare}
              aria-label="分享到 X (Twitter)"
            >
              <XFilledSvg className="size-10" />
            </Button>
            <Button
              type="button"
              variant="link"
              size="icon"
              onClick={shareAPI.linkedinShare}
              aria-label="分享到 LinkedIn"
            >
              <LinkedinFilledSvg className="size-10" />
            </Button>
            <Button
              type="button"
              variant="link"
              size="icon"
              className="bg-light-blue rounded-lg"
              onClick={shareAPI.nativeShare}
              aria-label="分享到其他平台"
            >
              <ExternalLink className="size-7" />
            </Button>
          </div>

          {/* 下載打卡圖片按鈕 */}
          <Button
            type="button"
            variant="ctaOrange"
            className="w-full"
            onClick={handleDownloadImage}
            disabled={isGenerating}
          >
            <Download className="size-4.5" />
            {isGenerating ? "正在生成圖片..." : "下載打卡圖片"}
          </Button>
        </motion.section>

        {/* 回到主頁 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Button
            onClick={handleBackToHome}
            variant="ghost"
            className="w-full justify-center"
            animation="none"
          >
            回到主頁
            <ArrowRightOutlineSvg className="size-4.5" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
}

export { MoodIconMap };
