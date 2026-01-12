"use client";

import { NotebookHoleSvg, TapeSvg } from "@daodao/assets";
import { CircularText } from "@daodao/ui/components/circular-text";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { format, isValid } from "date-fns";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";

interface CheckInCardProps {
  taskTitle: string;
  date: string;
  mood: MoodType | null;
  content: string;
  tags: string[];
  images?: string[];
  titleClassName?: string;
  onImageClick?: (index: number) => void;
  showTape?: boolean;
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
}: CheckInCardProps) => {
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
      <div className={`px-2 pb-5 text-center ${titleClassName}`}>
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
              backgroundSize: "280px 39px",
              backgroundRepeat: "repeat-y",
              backgroundPositionX: "15px",
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
              <p className="text-text-dark font-medium whitespace-pre-wrap">{content}</p>

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
                <div className="relative -mt-14">
                  {images.map((imageUrl: string, index: number) => {
                    const imageElement = (
                      <>
                        {index === 0 && showTape && (
                          <TapeSvg
                            width={70}
                            height={38}
                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-6 z-10"
                          />
                        )}
                        <Image
                          src={imageUrl}
                          alt={`打卡圖片 ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </>
                    );

                    if (onImageClick) {
                      return (
                        <button
                          type="button"
                          key={imageUrl}
                          onClick={() => onImageClick(index)}
                          className={cn(
                            "relative block aspect-103/67 rounded border w-[206px] cursor-pointer transition-shadow hover:shadow-lg",
                            index === 0 && "top-16 left-4 -rotate-8 z-2",
                            index === 1 && "ml-auto right-4 rotate-12 z-1",
                            index === 2 && "mx-auto bottom-5"
                          )}
                          aria-label={`查看圖片 ${index + 1}`}
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
                          index === 0 && "top-16 left-4 -rotate-8 z-2",
                          index === 1 && "ml-auto right-4 rotate-12 z-1",
                          index === 2 && "mx-auto bottom-5"
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

