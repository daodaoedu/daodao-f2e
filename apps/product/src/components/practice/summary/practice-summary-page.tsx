"use client";

import type { MoodType, PracticeSummary, UpdatePracticeRequestType } from "@daodao/api";
import { updatePractice } from "@daodao/api";
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
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { dataUrlToFile, getShareAPI } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { ConfettiAnimation } from "@daodao/ui/components/confetti-animation";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Download, ExternalLink, Globe } from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType } from "react";
import { useState } from "react";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { usePracticeSummaryImage } from "./hooks";
import { PracticeSummaryCard } from "./practice-summary-card";

interface PracticeSummaryPageProps {
  summary: PracticeSummary;
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
export function PracticeSummaryPage({ summary }: PracticeSummaryPageProps) {
  const t = useTranslations("practice");
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // 使用摘要圖片生成 hook
  const { summaryCardRef, isGenerating, downloadImage, generateImage } = usePracticeSummaryImage({
    practiceName: summary.practiceName,
  });

  const handleBackToHome = () => {
    router.push("/");
  };

  const handlePublish = async () => {
    if (isPublic || isPublishing) return;
    setIsPublishing(true);
    try {
      await updatePractice(summary.practiceId, {
        privacy_status: "public",
      } as UpdatePracticeRequestType);
      setIsPublic(true);
    } catch {
      toast.error(t("summary_page_publish_failed"));
    } finally {
      setIsPublishing(false);
    }
  };

  // 準備分享內容
  const shareText = t("summary_page_share_text", {
    practiceName: summary.practiceName,
    checkInCount: String(summary.checkInCount),
  });
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareAPI = getShareAPI({
    title: t("summary_page_share_og_title", { userName: summary.userName }),
    text: shareText,
    url: shareUrl,
    hashtag: t("summary_page_share_hashtag"),
  });

  // 處理下載圖片
  const handleDownloadImage = async () => {
    await downloadImage();
  };

  const handleNativeShare = async () => {
    const imageData = await generateImage();
    const imageFile = imageData
      ? dataUrlToFile(imageData.src, `${summary.practiceName || "practice"}-summary.png`)
      : null;

    try {
      const didShare = await shareAPI.nativeShare?.({
        files: imageFile ? [imageFile] : [],
        nativeText: shareText,
      });

      if (!didShare) {
        toast.error(t("summary_page_no_share"));
      }
    } catch (error) {
      const isCancelled = error instanceof DOMException && error.name === "AbortError";
      if (!isCancelled) {
        toast.error(t("summary_page_share_failed"));
      }
    }
  };

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <PageHeader leftAction="back" leftLabel="" title="" rightActionTo="/" />

      <BackgroundAnimation />

      {/* 撒花動畫 */}
      <ConfettiAnimation />

      <main className="relative max-w-[448px] mx-auto px-5 pb-24">
        {/* Public toggle */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4 border border-[#C1ECFF]">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-logo-cyan" />
            <div>
              <p className="text-sm font-medium text-text-dark">
                {t("summary_page_publish_label")}
              </p>
              <p className="text-xs text-text-dark/50">{t("summary_page_publish_desc")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublic || isPublishing}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              isPublic
                ? "bg-[#E6FBF8] text-logo-cyan cursor-default"
                : "bg-logo-cyan text-white hover:bg-logo-cyan/90"
            )}
          >
            {isPublic
              ? t("summary_page_published")
              : isPublishing
                ? t("summary_page_publishing")
                : t("summary_page_publish")}
          </button>
        </div>

        {/* 慶祝區塊 */}
        <section className="text-center py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl font-bold text-text-dark mb-2">{t("summary_page_complete")}</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-text-dark mb-4">{t("summary_page_subtitle")}</p>
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
            <p className="font-inter text-sm font-normal text-text-dark text-center leading-loose">
              {summary.encouragementText}
            </p>
            <p className="font-inter text-sm font-normal text-text-dark text-center leading-loose mt-1">
              {t("summary_page_journey")}
            </p>
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
            {t("summary_page_share_title")}
          </h3>
          <div className="flex justify-center gap-4 mb-4">
            <Button
              type="button"
              variant="link"
              size="icon"
              onClick={shareAPI.lineShare}
              aria-label={t("summary_page_share_line")}
            >
              <LineFilledSvg className="size-10" />
            </Button>
            <Button
              type="button"
              variant="link"
              size="icon"
              onClick={shareAPI.threadsShare}
              aria-label={t("summary_page_share_threads")}
            >
              <ThreadsFilledSvg className="size-10 text-logo-purple" />
            </Button>
            <Button
              type="button"
              variant="link"
              size="icon"
              onClick={shareAPI.facebookShare}
              aria-label={t("summary_page_share_facebook")}
            >
              <FacebookFilledSvg className="size-10 text-logo-blue" />
            </Button>
            <Button
              type="button"
              variant="link"
              size="icon"
              onClick={shareAPI.xShare}
              aria-label={t("summary_page_share_x")}
            >
              <XFilledSvg className="size-10" />
            </Button>
            <Button
              type="button"
              variant="link"
              size="icon"
              onClick={shareAPI.linkedinShare}
              aria-label={t("summary_page_share_linkedin")}
            >
              <LinkedinFilledSvg className="size-10" />
            </Button>
            <Button
              type="button"
              variant="link"
              size="icon"
              className="bg-light-blue rounded-lg"
              onClick={handleNativeShare}
              aria-label={t("summary_page_share_other")}
            >
              <ExternalLink className="size-7" />
            </Button>
          </div>

          {/* 下載圖片按鈕 */}
          <Button
            type="button"
            variant="ctaOrange"
            className="w-full"
            onClick={handleDownloadImage}
            disabled={isGenerating}
          >
            <Download className="size-4.5" />
            {isGenerating ? t("summary_page_generating") : t("summary_page_download")}
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
            {t("summary_page_back_home")}
            <ArrowRightOutlineSvg className="size-4.5" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
}

export { MoodIconMap };
