"use client";

import { updatePracticeCheckInWithFormData, useMutate } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
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
  const t = useTranslations("check_in");

  const openPhase2Sheet = useCallback(
    (checkInId: string, mood: MoodType | null) => {
      const { close } = open({
        title: t("phase2_sheet_title"),
        description: t("phase2_sheet_description"),
        content: (
          <CheckInPhase2SheetContent
            taskTitle={taskTitle}
            mood={mood}
            onComplete={async (data) => {
              const loadingToast = toast.loading(t("saving"));
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
                toast.success(t("phase2_save_success"));
                onComplete?.();
              } catch (error) {
                toast.dismiss(loadingToast);
                const message = error instanceof Error ? error.message : t("phase2_save_failed");
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
    [practiceId, taskTitle, onComplete, open, mutate, t]
  );

  return { openPhase2Sheet };
}
