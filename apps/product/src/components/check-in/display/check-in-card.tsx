"use client";

import { NotebookHoleSvg, StampSvg, TapeSvg } from "@daodao/assets";
import { type CapturedImageData, captureElementAsImage } from "@daodao/shared";
import { cn } from "@daodao/ui/lib/utils";
import { format, isValid } from "date-fns";
import { useEffect, useRef } from "react";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";

interface ICheckInCardProps {
  taskTitle: string;
  date: string;
  mood: MoodType | null;
  content: string;
  tags: string[];
  images?: string[];
  titleClassName?: string;
  onImageClick?: (index: number) => void;
  showTape?: boolean;
  onMaskedImageReady?: (maskedImageData: CapturedImageData) => void;
}

/**
 * 在圖片上套用漸層遮罩
 */
const applyGradientMask = async (imageData: CapturedImageData): Promise<CapturedImageData> => {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(imageData);
        return;
      }

      // 使用高解析度 Canvas 以獲得清晰圖片
      const devicePixelRatio = window.devicePixelRatio || 1;
      const targetWidth = imageData.width * devicePixelRatio;
      const targetHeight = imageData.height * devicePixelRatio;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // 縮放 context 以保持正確的繪製比例
      ctx.scale(devicePixelRatio, devicePixelRatio);

      // 繪製原始圖片
      ctx.drawImage(img, 0, 0, imageData.width, imageData.height);

      // 繪製漸層遮罩
      const gradient = ctx.createLinearGradient(0, 0, 0, imageData.height);
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(1, "#FFFFFF");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, imageData.width, imageData.height);

      const maskedDataUrl = canvas.toDataURL("image/jpeg", 0.95);

      resolve({
        src: maskedDataUrl,
        width: imageData.width,
        height: imageData.height,
      });
    };

    img.onerror = () => {
      resolve(imageData);
    };

    img.src = imageData.src;
  });
};

/**
 * 打卡卡片組件
 * 用於顯示打卡內容，包含時間戳、心情、文字、標籤和圖片
 */
export const CheckInCard = ({
  taskTitle,
  date,
  mood,
  content,
  tags,
  images,
  titleClassName = "text-white",
  onImageClick,
  showTape = true,
  onMaskedImageReady,
}: ICheckInCardProps) => {
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

  const mainRef = useRef<HTMLDivElement>(null);
  const checkInImageRef = useRef<CapturedImageData | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!mainRef.current) return;
      const element = mainRef.current;
      const actualWidth = element.clientWidth;
      const actualHeight = element.clientHeight;
      const imageData = await captureElementAsImage(element, {
        width: actualWidth,
        height: actualHeight,
        x: 0,
        y: 0,
      });
      if (imageData) {
        const maskedImageData = await applyGradientMask(imageData);
        checkInImageRef.current = maskedImageData;
        onMaskedImageReady?.(maskedImageData);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [onMaskedImageReady]);

  return (
    <div className="max-w-[350px] mx-auto">
      {/* 實踐標題 */}
      <div className={`px-2 pb-5 text-center ${titleClassName}`}>
        <h2 className="text-lg font-semibold line-clamp-2">{taskTitle}</h2>
      </div>

      {/* 筆記本風格內容區 */}
      <div className="relative bg-white pb-9 mb-5 mt-5 rounded-b">
        {/* 筆記本裝訂線（頂部） */}
        <NotebookHoleSvg className="absolute -top-7 left-0" />

        <main
          ref={mainRef}
          className="pt-4.5 bg-white max-h-[460px] overflow-y-auto scrollbar-hide px-5"
        >
          <div
            className="pb-24"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, transparent 0px, transparent 38px, #99ECFF 38px, #99ECFF 39px)",
              backgroundSize: "280px 39px",
              backgroundRepeat: "repeat-y",
              backgroundPositionX: "15px",
              backgroundPositionY: "24px",
            }}
          >
            <div className="absolute top-0 left-0 w-full h-12 bg-white" />
            <div className="relative space-y-4">
              {/* 時間戳/印章 */}
              <div className="relative float-right anonymous-pro translate-x-2 translate-y-3 animate-stamp pointer-events-none z-30">
                <StampSvg width={100} height={100} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-bold text-logo-gray rotate-15 size-10 flex flex-col items-center justify-center">
                  <div>{dateYear}</div>
                  <div>{dateMonthDay}</div>
                </div>
              </div>

              {/* 心情狀態 */}
              {MoodEmoji && (
                <div className="flex items-center gap-2">
                  <MoodEmoji className="size-6" />
                  <span className="text-sm text-text-dark">心情{moodOption?.label}</span>
                </div>
              )}

              {/* 文字內容 */}
              <p className="text-text-dark font-medium whitespace-pre-wrap wrap-break-word">{content}</p>

              {/* 標籤 */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 text-logo-cyan text-sm">
                  {tags.map((tag) => (
                    <p key={tag}># {tag}</p>
                  ))}
                </div>
              )}

              {/* 圖片區域 */}
              {images && images.length > 1 && (
                <div className="relative -mt-14">
                  {images.slice(1, 4).map((imageUrl: string, displayIndex: number) => {
                    // displayIndex 是顯示時的索引（0, 1, 2）
                    // 實際的圖片索引是 displayIndex + 1（1, 2, 3）
                    const actualIndex = displayIndex + 1;
                    const imageElement = (
                      <>
                        {displayIndex === 0 && showTape && (
                          <TapeSvg
                            width={70}
                            height={38}
                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-6 z-10"
                          />
                        )}
                        <img
                          src={imageUrl}
                          alt={`打卡圖片 ${actualIndex + 1}`}
                          className="absolute inset-0 w-full h-full object-contain bg-white"
                        />
                      </>
                    );

                    if (onImageClick) {
                      return (
                        <button
                          type="button"
                          key={imageUrl}
                          onClick={() => onImageClick(actualIndex)}
                          className={cn(
                            "relative block aspect-103/67 rounded border w-[206px] cursor-pointer transition-shadow hover:shadow-lg",
                            displayIndex === 0 && "top-16 left-4 -rotate-8 z-2",
                            displayIndex === 1 && "ml-auto right-4 rotate-12 z-1",
                            displayIndex === 2 && "mx-auto bottom-5"
                          )}
                          aria-label={`查看圖片 ${actualIndex + 1}`}
                        >
                          {imageElement}
                        </button>
                      );
                    }

                    return (
                      <div
                        key={imageUrl}
                        className={cn(
                          "relative block aspect-103/67 rounded border overflow-hidden w-[206px]",
                          displayIndex === 0 && "top-16 left-4 -rotate-8 z-2",
                          displayIndex === 1 && "ml-auto right-4 rotate-12 z-1",
                          displayIndex === 2 && "mx-auto bottom-5"
                        )}
                      >
                        {imageElement}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
