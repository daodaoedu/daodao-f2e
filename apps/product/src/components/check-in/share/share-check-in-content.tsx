"use client";

import FacebookSvg from "@daodao/assets/images/social-icons/facebook-filled.svg";
import LineSvg from "@daodao/assets/images/social-icons/line-filled.svg";
import LinkedInSvg from "@daodao/assets/images/social-icons/linkedin-filled.svg";
import ThreadsSvg from "@daodao/assets/images/social-icons/threads-filled.svg";
import XSvg from "@daodao/assets/images/social-icons/x-filled.svg";
import { captureElementAsImage, getShareAPI } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Download, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CheckInCard } from "../display/check-in-card";
import type { ICheckInFormData } from "../types";

interface IShareCheckInSheetContentProps {
  taskTitle: string;
  checkInData: ICheckInFormData & { date: string; images?: string[] };
}

/**
 * 分享打卡 Sheet 的內容組件（不包含 Sheet 外層）
 * 可用於 SheetManager 或直接使用 ShareCheckInSheet
 */
export const ShareCheckInSheetContent = ({
  taskTitle,
  checkInData,
}: IShareCheckInSheetContentProps) => {
  const { description, images } = checkInData;

  const captureRef = useRef<HTMLDivElement>(null);
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);

  // Capture card on mount
  useEffect(() => {
    const timer = setTimeout(async () => {
      const element = captureRef.current;
      if (!element) {
        setIsCapturing(false);
        return;
      }
      try {
        const imageData = await captureElementAsImage(element);
        if (imageData) {
          setCardImageUrl(imageData.src);
        }
      } catch {
        // Capture failed silently — download button will stay disabled
      } finally {
        setIsCapturing(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 準備分享內容
  const shareText = `${taskTitle}\n${description || ""}`;
  const shareUrl = typeof window !== "undefined" ? window.location.pathname : "";

  const shareAPI = getShareAPI({
    title: taskTitle,
    text: shareText,
    url: shareUrl,
    hashtag: "#島島阿學",
  });

  // 處理下載打卡圖片
  const handleDownloadImage = () => {
    if (!cardImageUrl) return;
    try {
      const byteString = atob(cardImageUrl.split(",")[1] || "");
      const mimeType = cardImageUrl.split(",")[0]?.match(/:(.*?);/)?.[1] || "image/png";
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `check-in-${checkInData.date || Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("圖片已下載");
    } catch {
      toast.error("下載失敗");
    }
  };

  return (
    <>
      {/* Hidden card for screenshot capture */}
      <div className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
        <div ref={captureRef} className="w-[350px]">
          <CheckInCard
            taskTitle={taskTitle}
            titleClassName="hidden"
            date={checkInData.date}
            mood={checkInData.mood}
            content={checkInData.description}
            tags={checkInData.tags}
            images={images}
            showTape={false}
          />
        </div>
      </div>

      <div className="px-6 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col gap-8">
          <h2 className="text-xl font-medium text-bg-dark">{taskTitle}</h2>

          <div className="relative overflow-hidden w-[350px] min-h-[192px]">
            {isCapturing ? (
              <div className="flex items-center justify-center h-[192px] text-sm text-light-gray">
                生成分享圖片中...
              </div>
            ) : cardImageUrl ? (
              <img src={cardImageUrl} alt="打卡圖片" className="w-full object-contain bg-white" />
            ) : (
              <div className="flex items-center justify-center h-[192px] text-sm text-light-gray">
                無法生成圖片
              </div>
            )}
          </div>

          {/* 分享到社群媒體 */}
          <div>
            <h3 className="text-base font-medium mb-3 text-text-dark text-center">
              分享到社群媒體
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant="link"
                size="icon"
                onClick={shareAPI.lineShare}
                aria-label="分享到 LINE"
              >
                <LineSvg className="size-10" />
              </Button>
              <Button
                type="button"
                variant="link"
                size="icon"
                onClick={shareAPI.threadsShare}
                aria-label="分享到 Threads"
              >
                <ThreadsSvg className="size-10 text-logo-purple" />
              </Button>
              <Button
                type="button"
                variant="link"
                size="icon"
                onClick={shareAPI.facebookShare}
                aria-label="分享到 Facebook"
              >
                <FacebookSvg className="size-10 text-logo-blue" />
              </Button>
              <Button
                type="button"
                variant="link"
                size="icon"
                onClick={shareAPI.xShare}
                aria-label="分享到 X (Twitter)"
              >
                <XSvg className="size-10" />
              </Button>
              <Button
                type="button"
                variant="link"
                size="icon"
                onClick={shareAPI.linkedinShare}
                aria-label="分享到 LinkedIn"
              >
                <LinkedInSvg className="size-10" />
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
          </div>
        </div>

        {/* 下載打卡圖片 */}
        <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6 -mx-6 -mb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDownloadImage}
            disabled={isCapturing || !cardImageUrl}
          >
            <Download className="size-4.5" />
            {isCapturing ? "生成中..." : "下載打卡圖片"}
          </Button>
        </div>
      </div>
    </>
  );
};
