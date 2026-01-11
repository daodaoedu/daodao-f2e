"use client";

import { NotebookHoleSvg } from "@daodao/assets";
import FacebookSvg from "@daodao/assets/images/social-icons/facebook.svg";
import InstagramSvg from "@daodao/assets/images/social-icons/instagram.svg";
import LineSvg from "@daodao/assets/images/social-icons/line.svg";
import LinkedInSvg from "@daodao/assets/images/social-icons/linkedin.svg";
import XSvg from "@daodao/assets/images/social-icons/x.svg";
import { captureElementAsImage, getShareAPI } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { CircularText } from "@daodao/ui/components/circular-text";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { format, isValid } from "date-fns";
import { Download } from "lucide-react";
import { useRef } from "react";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";
import type { CheckInData } from "./check-in-sheet";

/**
 * 打卡卡片預覽組件（用於分享 Sheet 中顯示）
 */
const CheckInCardPreview = ({
  taskTitle,
  checkInData,
}: {
  taskTitle: string;
  checkInData: CheckInData & { date: string; images?: string[] };
}) => {
  const { date, mood, tags, description, images } = checkInData;
  const moodOption = mood ? MOOD_OPTIONS.find((option) => option.id === mood) : null;
  const MoodEmoji = moodOption?.emoji;

  // 格式化日期（將 "2026-01-01" 或 "2026.01.01" 轉換為 Date 物件）
  const dateStr = date.replace(/\./g, "-");
  const dateObj = new Date(dateStr);

  // 拆分日期為年份和月/日，用於印章中心顯示
  const dateYear = isValid(dateObj) ? format(dateObj, "yyyy") : date.split(/[.-]/)[0] || "";
  const dateMonthDay = isValid(dateObj)
    ? format(dateObj, "MM/dd")
    : date.split(/[.-]/).slice(1).join("/") || "";

  return (
    <div className="max-w-[350px] mx-auto">
      {/* 實踐標題 */}
      <div className="text-text-dark px-2 pb-5 text-center">
        <h2 className="text-lg font-semibold line-clamp-2">{taskTitle}</h2>
      </div>

      {/* 筆記本風格內容區 */}
      <div className="relative bg-white pb-9 mb-5 mt-[49px] rounded-b">
        {/* 筆記本裝訂線（頂部） */}
        <NotebookHoleSvg className="absolute bottom-full left-0" />

        <main className="max-h-[460px] overflow-y-auto px-5">
          <div
            style={{
              backgroundImage:
                "linear-gradient(to bottom, transparent 0px, transparent 38px, #99ECFF 38px, #99ECFF 39px)",
              backgroundSize: "100% 39px",
              backgroundRepeat: "repeat-y",
              backgroundPositionY: "24px",
            }}
          >
            <div className="absolute top-0 left-0 w-full h-8 bg-white" />
            <div className="relative space-y-4">
              {/* 時間戳/印章 */}
              <div className="float-right anonymous-pro rotate-15 translate-x-2 translate-y-3">
                <CircularText
                  size={100}
                  fontSize={0.1}
                  additionalSpacing={-0.15}
                  className="rounded-full border border-logo-gray"
                  text="Practice Checked In • Practice Checked In • "
                  textClassName="text-logo-gray -rotate-15 origin-center font-bold"
                  textRadius={0.75}
                  centerContent={
                    <div className="text-center border-t border-b border-logo-gray size-10 flex flex-col items-center justify-center">
                      <div className="text-xs font-bold text-logo-gray">{dateYear}</div>
                      <div className="text-xs font-bold text-logo-gray">{dateMonthDay}</div>
                    </div>
                  }
                />
              </div>

              {/* 心情狀態 */}
              {MoodEmoji && (
                <div className="flex items-center gap-2">
                  <MoodEmoji className="size-6" />
                  <span className="text-sm text-text-dark">心情{moodOption?.label}</span>
                </div>
              )}

              {/* 文字內容 */}
              <p className="text-text-dark font-medium whitespace-pre-wrap">{description}</p>

              {/* 標籤 */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 text-logo-cyan text-sm">
                  {tags.map((tag) => (
                    <p key={tag}># {tag}</p>
                  ))}
                </div>
              )}

              {/* 圖片區域 */}
              {images && images.length > 0 && (
                <div className="relative">
                  {images.map((imageUrl: string, index: number) => (
                    <div
                      key={imageUrl}
                      className={cn(
                        "relative block aspect-103/67 rounded border overflow-hidden w-[206px]",
                        index === 0 && "top-4 left-4 -rotate-6 z-2",
                        index === 1 && "ml-auto right-4 rotate-8 z-1",
                        index === 2 && "mx-auto bottom-4"
                      )}
                    >
                      <Image
                        src={imageUrl}
                        alt={`打卡圖片 ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * 分享打卡 Sheet 的內容組件（不包含 Sheet 外層）
 * 可用於 SheetManager 或直接使用 ShareCheckInSheet
 */
export const ShareCheckInSheetContent = ({
  taskTitle,
  checkInData,
  onClose,
}: {
  taskTitle: string;
  checkInData: CheckInData & { date: string; images?: string[] };
  onClose?: () => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 準備分享內容
  const shareText = `${taskTitle}\n${checkInData.description || ""}`;
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
    if (!cardRef.current) return;

    try {
      const imageData = await captureElementAsImage(cardRef.current);
      if (!imageData) return;

      // 創建下載連結
      const link = document.createElement("a");
      link.href = imageData.src;
      link.download = `打卡-${checkInData.date}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("下載圖片失敗:", error);
    }
  };

  return (
    <div className="px-6">
      {/* 打卡卡片預覽 */}
      <div ref={cardRef} className="mb-8">
        <CheckInCardPreview taskTitle={taskTitle} checkInData={checkInData} />
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

