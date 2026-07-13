"use client";

import FacebookSvg from "@daodao/assets/images/social-icons/facebook-filled.svg";
import LineSvg from "@daodao/assets/images/social-icons/line-filled.svg";
import LinkedInSvg from "@daodao/assets/images/social-icons/linkedin-filled.svg";
import ThreadsSvg from "@daodao/assets/images/social-icons/threads-filled.svg";
import XSvg from "@daodao/assets/images/social-icons/x-filled.svg";
import { useTranslations } from "@daodao/i18n";
import { captureElementAsImage, dataUrlToFile, getShareAPI } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Download, ExternalLink, Link } from "lucide-react";
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
  const t = useTranslations("app_product");
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
    nativeText: shareText,
    url: shareUrl,
    hashtag: t("share_hashtag"),
  });

  const handleNativeShare = async () => {
    const imageFile = cardImageUrl
      ? dataUrlToFile(cardImageUrl, `check-in-${checkInData.date || "card"}.png`)
      : null;

    try {
      const didShare = await shareAPI.nativeShare?.({
        files: imageFile ? [imageFile] : [],
        nativeText: shareText,
      });

      if (!didShare) {
        toast.error(t("share_native_unsupported"));
      }
    } catch (error) {
      const isCancelled = error instanceof DOMException && error.name === "AbortError";
      if (!isCancelled) {
        toast.error(t("share_failed_retry"));
      }
    }
  };

  // 複製打卡詳細頁的網頁連結
  const handleCopyLink = async () => {
    const didCopy = await shareAPI.copyLink?.();
    if (didCopy) {
      toast.success(t("share_link_copied"));
    } else {
      toast.error(t("share_link_copy_failed"));
    }
  };

  // 處理下載打卡圖片
  const handleDownloadImage = () => {
    if (!cardImageUrl) return;
    try {
      const imageFile = dataUrlToFile(cardImageUrl, `check-in-${checkInData.date || "card"}.png`);
      if (!imageFile) {
        toast.error(t("share_download_failed"));
        return;
      }

      const blob = new Blob([imageFile], { type: imageFile.type });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = imageFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success(t("share_image_downloaded"));
    } catch {
      toast.error(t("share_download_failed"));
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
                {t("share_generating_image")}
              </div>
            ) : cardImageUrl ? (
              <img
                src={cardImageUrl}
                alt={t("share_check_in_image_alt")}
                className="w-full object-contain bg-white"
              />
            ) : (
              <div className="flex items-center justify-center h-[192px] text-sm text-light-gray">
                {t("share_image_unavailable")}
              </div>
            )}
          </div>

          {/* 分享到社群媒體 */}
          <div>
            <h3 className="text-base font-medium mb-3 text-text-dark text-center">
              {t("share_social_title")}
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant="link"
                size="icon"
                onClick={shareAPI.lineShare}
                aria-label={t("share_to_platform", { platform: "LINE" })}
              >
                <LineSvg className="size-10" />
              </Button>
              <Button
                type="button"
                variant="link"
                size="icon"
                onClick={shareAPI.threadsShare}
                aria-label={t("share_to_platform", { platform: "Threads" })}
              >
                <ThreadsSvg className="size-10 text-logo-purple" />
              </Button>
              <Button
                type="button"
                variant="link"
                size="icon"
                onClick={shareAPI.facebookShare}
                aria-label={t("share_to_platform", { platform: "Facebook" })}
              >
                <FacebookSvg className="size-10 text-logo-blue" />
              </Button>
              <Button
                type="button"
                variant="link"
                size="icon"
                onClick={shareAPI.xShare}
                aria-label={t("share_to_platform", { platform: "X (Twitter)" })}
              >
                <XSvg className="size-10" />
              </Button>
              <Button
                type="button"
                variant="link"
                size="icon"
                onClick={shareAPI.linkedinShare}
                aria-label={t("share_to_platform", { platform: "LinkedIn" })}
              >
                <LinkedInSvg className="size-10" />
              </Button>
              <Button
                type="button"
                variant="link"
                size="icon"
                className="bg-light-blue rounded-lg"
                onClick={handleCopyLink}
                aria-label={t("share_copy_link")}
              >
                <Link className="size-7" />
              </Button>
              <Button
                type="button"
                variant="link"
                size="icon"
                className="bg-light-blue rounded-lg"
                onClick={handleNativeShare}
                aria-label={t("share_to_other")}
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
            {isCapturing ? t("share_generating") : t("share_download_check_in_image")}
          </Button>
        </div>
      </div>
    </>
  );
};
