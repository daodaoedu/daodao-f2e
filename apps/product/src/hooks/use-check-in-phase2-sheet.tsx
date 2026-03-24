"use client";

import { updatePracticeCheckInWithFormData, useMutate } from "@daodao/api";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback, useRef } from "react";
import { CheckInPhase2SheetContent } from "@/components/check-in/form/check-in-sheet";
import type { MoodType } from "@/constants/mood";
import { mapMoodTypeToApiMood } from "@/constants/mood";

interface IUseCheckInPhase2SheetOptions {
  practiceId: string;
  taskTitle: string;
  onComplete?: () => void;
}

/**
 * 打卡第二階段 Sheet
 * 在快速打卡（心情）完成後，引導使用者補充標籤、心得與照片
 */
export function useCheckInPhase2Sheet({
  practiceId,
  taskTitle,
  onComplete,
}: IUseCheckInPhase2SheetOptions) {
  const { open } = useSheetManager();
  const mutate = useMutate();
  const closeRef = useRef<(() => void) | null>(null);

  const openPhase2Sheet = useCallback(
    (checkInId: string, mood: MoodType | null) => {
      const { close } = open({
        title: "分享心得",
        description: "補充你的標籤、心得與照片",
        content: (
          <CheckInPhase2SheetContent
            taskTitle={taskTitle}
            mood={mood}
            onComplete={async (data) => {
              const loadingToast = toast.loading("儲存中...");
              try {
                const apiMood = data.mood ? mapMoodTypeToApiMood(data.mood) : undefined;
                await updatePracticeCheckInWithFormData(practiceId, checkInId, {
                  mood: apiMood,
                  tags: data.tags,
                  description: data.description,
                  media: data.media,
                });
                closeRef.current?.();
                // 刷新打卡列表 cache
                await mutate([
                  "/api/v1/practices/{id}/checkins",
                  { params: { path: { id: practiceId }, query: {} } },
                ] as const);
                toast.dismiss(loadingToast);
                toast.success("心得已儲存！");
                onComplete?.();
              } catch (error) {
                toast.dismiss(loadingToast);
                const message = error instanceof Error ? error.message : "儲存失敗，請稍後再試";
                toast.error(message);
              }
            }}
          />
        ),
        dismissible: true,
        closeOnEscape: true,
        showCloseButton: true,
      });
      closeRef.current = close;
    },
    [practiceId, taskTitle, onComplete, open, mutate]
  );

  return { openPhase2Sheet };
}
