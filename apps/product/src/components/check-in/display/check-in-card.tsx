"use client";

import { NotebookHoleSvg, StampSvg, TapeSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { parseTextLinks } from "@daodao/shared/lib/parse-text-links";
import { cn } from "@daodao/ui/lib/utils";
import { format, isValid } from "date-fns";
import * as React from "react";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";
import { isBlankContent } from "@/utils/check-in-content";
import { MOOD_LABEL_CLASSNAME, TAG_CLASSNAME } from "./check-in-card-classnames";

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
  /** 標題下方插入的額外內容（例如同日打卡切換導航） */
  afterTitle?: React.ReactNode;
  /** 卡片底部互動區（reaction + 留言按鈕） */
  bottomActions?: React.ReactNode;
  /** 是否為本人的打卡（true 才顯示空白提示） */
  showEmptyHint?: boolean;
  /** 截圖模式：移除高度限制與滾動，確保完整截圖 */
  isCapture?: boolean;
}

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
  afterTitle,
  bottomActions,
  showEmptyHint = false,
  isCapture = false,
}: ICheckInCardProps) => {
  const t = useTranslations("check_in");
  const moodOption = mood ? MOOD_OPTIONS.find((option) => option.id === mood) : null;
  const moodLabel = mood ? t(`moods.${mood}`) : "";
  const MoodEmoji = moodOption?.emoji;

  const mainRef = React.useRef<HTMLElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = React.useState(false);

  const handleScroll = React.useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    setIsScrolledToBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 2);
  }, []);

  // 初始檢查（內容不足以滾動時，直接隱藏遮罩）
  React.useEffect(() => {
    handleScroll();
  }, [handleScroll]);

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
      <div className={`px-2 pb-5 text-center ${titleClassName}`}>
        <h2 className="text-lg font-semibold line-clamp-2">{taskTitle}</h2>
      </div>

      {/* 標題下方額外內容（如同日打卡切換） */}
      {afterTitle}

      {/* 筆記本風格內容區 */}
      <div className={cn("relative bg-white mb-5 mt-5 rounded-b", bottomActions ? "" : "pb-9")}>
        {/* 筆記本裝訂線（頂部） */}
        <NotebookHoleSvg className="absolute -top-7 left-0" />

        {/* 可滾動內容區 + 底部漸層遮罩 */}
        <div className="relative">
          <main
            ref={mainRef}
            onScroll={handleScroll}
            className={cn(
              "pt-4.5 bg-white scrollbar-hide px-5",
              !isCapture && "max-h-[400px] overflow-y-auto"
            )}
          >
            <div
              className={images && images.filter(Boolean).length > 0 ? "pb-24" : "pb-8"}
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
                    <span className={MOOD_LABEL_CLASSNAME}>
                      {t("mood_label", { label: moodLabel || moodOption?.label || "" })}
                    </span>
                  </div>
                )}

                {/* 文字內容 */}
                {isBlankContent(content) && showEmptyHint ? (
                  <p className="text-light-gray text-sm italic">{t("empty_content_hint")}</p>
                ) : (
                  <p className="text-text-dark font-medium whitespace-pre-wrap wrap-break-word">
                    {parseTextLinks(content).map((seg, i) =>
                      seg.type === "url" &&
                      (seg.value.startsWith("https://") || seg.value.startsWith("http://")) ? (
                        <a
                          key={`${i}-url`}
                          href={seg.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-logo-cyan underline break-all"
                        >
                          {seg.value}
                        </a>
                      ) : (
                        <React.Fragment key={`${i}-text`}>{seg.value}</React.Fragment>
                      )
                    )}
                  </p>
                )}

                {/* 標籤 */}
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-logo-cyan text-sm">
                    {tags.map((tag) => (
                      <p key={tag} className={TAG_CLASSNAME}>
                        # {tag}
                      </p>
                    ))}
                  </div>
                )}

                {/* 圖片區域 */}
                {images && images.filter(Boolean).length > 0 && (
                  <div className="relative -mt-14">
                    {images
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((imageUrl: string, displayIndex: number) => {
                        const actualIndex = displayIndex;
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
                              alt={t("image_alt", { n: actualIndex + 1 })}
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
                              aria-label={t("view_image_label", { n: actualIndex + 1 })}
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

          {/* 底部漸層遮罩（捲動到底時消失） */}
          {!isCapture && !isScrolledToBottom && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-white/0 to-white pointer-events-none z-10" />
          )}
        </div>

        {bottomActions}
      </div>
    </div>
  );
};
