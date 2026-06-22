"use client";

import { useTranslations } from "@daodao/i18n";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { useCallback, useRef } from "react";
import type { CheckInData } from "@/components/check-in";
import { CheckInSheetContent } from "@/components/check-in";
import type { MoodType } from "@/constants/mood";

interface IEditCheckInData {
  mood: MoodType | null;
  tags: string[];
  description: string;
  images?: string[];
}

interface IUseEditCheckInSheetOptions {
  /** 任務標題 */
  taskTitle: string;
  /** 現有的打卡資料 */
  checkInData: IEditCheckInData;
  /** 編輯完成回調 */
  onComplete: (data: CheckInData) => Promise<void> | void;
  /** 關閉時的回調 */
  onClose?: () => void;
}

/**
 * 使用全局 SheetManager 來顯示編輯打卡 Sheet 的 Hook
 */
export function useEditCheckInSheet({
  taskTitle,
  checkInData,
  onComplete,
  onClose,
}: IUseEditCheckInSheetOptions) {
  const t = useTranslations("check_in");
  const { open } = useSheetManager();
  const closeRef = useRef<(() => void) | null>(null);

  const openEditCheckInSheet = useCallback(() => {
    const { close } = open({
      title: t("edit_sheet_title"),
      description: t("edit_sheet_description"),
      content: (
        <CheckInSheetContent
          taskTitle={taskTitle}
          showMood={true}
          initialValues={{
            mood: checkInData.mood,
            tags: checkInData.tags,
            description: checkInData.description,
            media: [],
          }}
          existingImages={checkInData.images}
          submitButtonText={t("save_changes")}
          onComplete={async (data) => {
            try {
              await onComplete(data);
              closeRef.current?.(); // 僅在成功時關閉
            } catch {
              // 預期 onComplete 的實作會處理錯誤（例如顯示 toast）
              // 保持 Sheet 開啟，讓使用者可以重試
            }
          }}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
      onClose: onClose,
    });
    closeRef.current = close;
  }, [taskTitle, checkInData, onComplete, onClose, open, t]);

  return { openEditCheckInSheet };
}
