"use client";

import * as React from "react";
import { NotebookHoleSvg } from "@daodao/assets";
import { Button } from "@daodao/ui/components/button";
import { CircularText } from "@daodao/ui/components/circular-text";
import { Image } from "@daodao/ui/components/image";
import { ImageLightbox } from "@daodao/ui/components/image-lightbox";
import { cn } from "@daodao/ui/lib/utils";
import { format, isValid } from "date-fns";
import { Share2, Trash2 } from "lucide-react";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";
import { useDeleteCheckInDialog } from "@/hooks/use-delete-check-in-dialog";

export interface CheckInData {
  id: string;
  date: string;
  mood: MoodType;
  content: string;
  tags: string[];
  images?: string[];
  practiceTitle: string;
}

interface CheckInDetailProps {
  checkInData: CheckInData;
}

export const CheckInDetail = ({ checkInData }: CheckInDetailProps) => {
  const { date, mood, content, tags, images, practiceTitle } = checkInData;
  const moodOption = MOOD_OPTIONS.find((option) => option.id === mood);
  const MoodEmoji = moodOption?.emoji;

  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  // 格式化日期（將 "2026.01.01" 轉換為 Date 物件）
  // 注意：需要將 "2026.01.01" 轉換為 "2026-01-01" 格式才能正確解析
  const dateStr = date.replace(/\./g, "-");
  const dateObj = new Date(dateStr);

  // 拆分日期為年份和月/日，用於印章中心顯示
  const dateYear = isValid(dateObj) ? format(dateObj, "yyyy") : date.split(".")[0] || "";
  const dateMonthDay = isValid(dateObj)
    ? format(dateObj, "MM/dd")
    : date.split(".").slice(1).join("/") || "";

  // 處理分享功能
  const handleShare = () => {
    // TODO: 實作分享功能
  };

  // 處理刪除打卡
  const { openDeleteDialog } = useDeleteCheckInDialog({
    onConfirm: () => {
      // TODO: 實作刪除打卡功能
    },
    onCancel: () => {},
  });

  // 處理圖片點擊，開啟 lightbox
  const handleImageClick = React.useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  return (
    <div className="max-w-[350px] mx-auto">
      {/* 實踐標題 */}
      <div className="text-white px-2 pb-5 text-center">
        <h2 className="text-lg font-semibold line-clamp-2">{practiceTitle}</h2>
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
                <div className="relative">
                  {images.map((imageUrl: string, index: number) => (
                    <button
                      type="button"
                      key={imageUrl}
                      onClick={() => handleImageClick(index)}
                      className={cn(
                        "relative block aspect-103/67 rounded border overflow-hidden w-[206px] cursor-pointer",
                        index === 0 && "top-4 left-4 -rotate-6 z-2",
                        index === 1 && "ml-auto right-4 rotate-8 z-1",
                        index === 2 && "mx-auto bottom-4"
                      )}
                      aria-label={`查看圖片 ${index + 1}`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`打卡圖片 ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <div className="flex flex-col w-fit gap-4 mx-auto">
        {/* 分享按鈕 */}
        <Button onClick={handleShare} variant="white">
          <Share2 className="size-4 mr-2" />
          分享這篇打卡
        </Button>
        <Button variant="ghost" className="px-8 text-white hover:text-white/80 border border-white" onClick={openDeleteDialog}>
          <Trash2 className="size-4.5" />
          <span>刪除打卡</span>
        </Button>
      </div>

      {/* 圖片 Lightbox */}
      {images && images.length > 0 && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}
    </div>
  );
};
