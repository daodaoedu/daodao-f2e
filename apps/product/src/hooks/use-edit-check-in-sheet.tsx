"use client";

import { useTranslations } from "@daodao/i18n";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { useCallback, useRef } from "react";
import type { CheckInData } from "@/components/check-in";
import { CheckInSheetContent } from "@/components/check-in";
import { createEditSheetCompleteHandler } from "@/components/check-in/form/check-in-submit-flow";
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
          initialValues={{
            mood: checkInData.mood,
            tags: checkInData.tags,
            description: checkInData.description,
            media: [],
          }}
          existingImages={checkInData.images}
          submitButtonText={t("save_changes")}
          // 成功才關閉；失敗的錯誤（toast 由 onComplete 顯示）往上傳給表單，
          // 表單據此保留使用者的修改（daodao#383）
          onComplete={createEditSheetCompleteHandler(onComplete, () => closeRef.current)}
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
