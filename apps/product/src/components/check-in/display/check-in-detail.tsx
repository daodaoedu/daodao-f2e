"use client";

import { Button } from "@daodao/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { ImageLightbox } from "@daodao/ui/components/image-lightbox";
import { Ellipsis, Share2 } from "lucide-react";
import * as React from "react";
import { useEditCheckInSheet } from "@/hooks/use-edit-check-in-sheet";
import { useShareCheckInSheet } from "@/hooks/use-share-check-in-sheet";
import type { ICheckInDisplayData, ICheckInFormData } from "../types";
import { CheckInCard } from "./check-in-card";

export type { ICheckInDisplayData as CheckInData };

interface ICheckInDetailProps {
  checkInData: ICheckInDisplayData;
  /** 編輯完成回調 */
  onEditComplete?: (data: ICheckInFormData) => Promise<void> | void;
  /** 標題下方額外內容（如同日打卡切換導航） */
  afterTitle?: React.ReactNode;
}

export const CheckInDetail = ({ checkInData, onEditComplete, afterTitle }: ICheckInDetailProps) => {
  const { date, mood, content, tags, images, practiceTitle } = checkInData;

  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  // 處理編輯打卡
  const { openEditCheckInSheet } = useEditCheckInSheet({
    taskTitle: practiceTitle,
    checkInData: {
      mood,
      tags,
      description: content,
    },
    onComplete: async (data) => {
      await onEditComplete?.(data);
    },
  });

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
    } as ICheckInFormData & { date: string; images?: string[] },
  });

  // 處理圖片點擊，開啟 lightbox
  const handleImageClick = React.useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  return (
    <div className="max-w-[350px] mx-auto">
      {/* 編輯選單 */}
      {onEditComplete && (
        <div className="flex justify-end mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-full bg-primary-darker/60 text-white hover:bg-primary-darker/80 hover:text-white"
              >
                <Ellipsis className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openEditCheckInSheet}>編輯打卡</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <CheckInCard
        taskTitle={practiceTitle}
        date={date}
        mood={mood}
        content={content}
        tags={tags}
        images={images}
        onImageClick={handleImageClick}
        showTape={true}
        afterTitle={afterTitle}
      />

      <div className="flex flex-col w-fit gap-4 mx-auto">
        {/* 分享按鈕 */}
        <Button variant="white" className="px-8" onClick={openShareSheet}>
          <Share2 className="size-4 mr-2" />
          分享這篇打卡
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
