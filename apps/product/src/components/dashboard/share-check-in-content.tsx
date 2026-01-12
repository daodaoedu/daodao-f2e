"use client";

import FacebookSvg from "@daodao/assets/images/social-icons/facebook.svg";
import InstagramSvg from "@daodao/assets/images/social-icons/instagram.svg";
import LineSvg from "@daodao/assets/images/social-icons/line.svg";
import LinkedInSvg from "@daodao/assets/images/social-icons/linkedin.svg";
import XSvg from "@daodao/assets/images/social-icons/x.svg";
import { getShareAPI } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { Download } from "lucide-react";
import type { CheckInData } from "./check-in-sheet";
import { CheckInCard } from "../practice/detail/check-in-card";

/**
 * 分享打卡 Sheet 的內容組件（不包含 Sheet 外層）
 * 可用於 SheetManager 或直接使用 ShareCheckInSheet
 */
export const ShareCheckInSheetContent = ({
  taskTitle,
  checkInData,
}: {
  taskTitle: string;
  checkInData: CheckInData & { date: string; images?: string[] };
  onClose?: () => void;
}) => {
  const { date, mood, tags, description, images } = checkInData;

  // 準備分享內容
  const shareText = `${taskTitle}\n${description || ""}`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareAPI = getShareAPI({
    title: taskTitle,
    text: shareText,
    url: shareUrl,
    hashtag: "#島島阿學",
  });

  // 處理 Instagram 分享（使用 Threads，因為 Instagram 沒有直接的分享 API）
  const handleInstagramShare = () => {
    if (shareAPI.threadsShare) {
      shareAPI.threadsShare();
    }
  };

  // 處理下載打卡圖片
  const handleDownloadImage = async () => {
    try {
      // TODO: 實作下載圖片功能
    } catch (error) {
      console.error("下載圖片失敗:", error);
    }
  };

  return (
    <div className="px-6">
      {/* 打卡卡片預覽 */}
      <div className="relative mb-8">
        <CheckInCard
          taskTitle={taskTitle}
          date={date}
          mood={mood}
          content={description}
          tags={tags}
          images={images}
          titleClassName="text-text-dark"
          showTape={false}
        />
      </div>

      {/* 分享到社群媒體 */}
      <div className="mb-8">
        <h3 className="text-base font-medium mb-3 text-text-dark text-center">
          分享到社群媒體
        </h3>
        <div className="flex justify-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-12"
            onClick={shareAPI.lineShare}
            aria-label="分享到 LINE"
          >
            <LineSvg className="size-6" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-12"
            onClick={handleInstagramShare}
            aria-label="分享到 Instagram"
          >
            <InstagramSvg className="size-6" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-12"
            onClick={shareAPI.facebookShare}
            aria-label="分享到 Facebook"
          >
            <FacebookSvg className="size-6" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-12"
            onClick={shareAPI.xShare}
            aria-label="分享到 X (Twitter)"
          >
            <XSvg className="size-6" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-12"
            onClick={shareAPI.linkedinShare}
            aria-label="分享到 LinkedIn"
          >
            <LinkedInSvg className="size-6" />
          </Button>
        </div>
      </div>

      {/* 下載打卡圖片 */}
      <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6 -mx-6 -mb-6">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDownloadImage}
        >
          <Download className="size-4.5" />
          下載打卡圖片
        </Button>
      </div>
    </div>
  );
};
