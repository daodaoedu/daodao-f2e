"use client";

import * as React from "react";
import { Button } from "@daodao/ui/components/button";
import { ImageLightbox } from "@daodao/ui/components/image-lightbox";
import { Share2, Trash2 } from "lucide-react";
import { type MoodType } from "@/constants/mood";
import { useDeleteCheckInDialog } from "@/hooks/use-delete-check-in-dialog";
import { useShareCheckInSheet } from "@/hooks/use-share-check-in-sheet";
import { CheckInCard } from "./check-in-card";

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

  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  // 處理刪除打卡
  const { openDeleteDialog } = useDeleteCheckInDialog();

  const handleDeleteCheckIn = async () => {
    const result = await openDeleteDialog();
    if (result.value === "confirm") {
      // TODO: 實作刪除打卡功能
    }
  };

  // 處理分享打卡
  const { openShareSheet } = useShareCheckInSheet({
    taskTitle: practiceTitle,
    checkInData: {
      mood,
      tags,
      description: content,
      media: [],
      date,
      images,
    },
  });

  // 處理圖片點擊，開啟 lightbox
  const handleImageClick = React.useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  return (
    <div className="max-w-[350px] mx-auto">
      <CheckInCard
        taskTitle={practiceTitle}
        date={date}
        mood={mood}
        content={content}
        tags={tags}
        images={images}
        onImageClick={handleImageClick}
        showTape={true}
      />

      <div className="flex flex-col w-fit gap-4 mx-auto">
        {/* 分享按鈕 */}
        <Button variant="white" className="px-8" onClick={openShareSheet}>
          <Share2 className="size-4 mr-2" />
          分享這篇打卡
        </Button>
        <Button
          variant="ghost"
          className="px-8 text-white hover:text-white/80 border border-white"
          onClick={handleDeleteCheckIn}
        >
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
