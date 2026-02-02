"use client";

import FacebookSvg from "@daodao/assets/images/social-icons/facebook-filled.svg";
import LineSvg from "@daodao/assets/images/social-icons/line-filled.svg";
import LinkedInSvg from "@daodao/assets/images/social-icons/linkedin-filled.svg";
import ThreadsSvg from "@daodao/assets/images/social-icons/threads-filled.svg";
import XSvg from "@daodao/assets/images/social-icons/x-filled.svg";
import { getShareAPI } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";
import { Download, ExternalLink } from "lucide-react";
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
  const handleDownloadImage = async () => {
    const imageUrl = images?.[0];
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `check-in-${checkInData.date || Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("下載圖片失敗:", error);
    }
  };

  return (
    <div className="px-6 flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col gap-8">
        <h2 className="text-xl font-medium text-bg-dark">{taskTitle}</h2>

        <div className="relative overflow-hidden w-[350px] h-[192px]">
          <Image src={images?.[0] ?? ""} alt="打卡圖片" fill className="object-contain bg-white" />
        </div>

        {/* 分享到社群媒體 */}
        <div>
          <h3 className="text-base font-medium mb-3 text-text-dark text-center">分享到社群媒體</h3>
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
        <Button type="button" variant="outline" className="w-full" onClick={handleDownloadImage}>
          <Download className="size-4.5" />
          下載打卡圖片
        </Button>
      </div>
    </div>
  );
};
