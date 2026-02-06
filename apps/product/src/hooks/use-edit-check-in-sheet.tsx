"use client";

import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { useCallback, useRef } from "react";
import type { CheckInData } from "@/components/check-in";
import { CheckInSheetContent } from "@/components/check-in";
import type { MoodType } from "@/constants/mood";

interface IEditCheckInData {
  mood: MoodType;
  tags: string[];
  description: string;
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
  const { open } = useSheetManager();
  const closeRef = useRef<(() => void) | null>(null);

  const openEditCheckInSheet = useCallback(() => {
    const { close } = open({
      title: "編輯打卡",
      description: "修改你的打卡內容",
      content: (
        <CheckInSheetContent
          taskTitle={taskTitle}
          initialValues={{
            mood: checkInData.mood,
            tags: checkInData.tags,
            description: checkInData.description,
            media: [],
          }}
          submitButtonText="儲存變更"
          onComplete={async (data) => {
            closeRef.current?.();
            await onComplete(data);
          }}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
      onClose: onClose,
    });
    closeRef.current = close;
  }, [taskTitle, checkInData, onComplete, onClose, open]);

  return { openEditCheckInSheet };
}
