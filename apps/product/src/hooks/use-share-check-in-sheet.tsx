"use client";

import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { useCallback } from "react";
import type { CheckInData } from "@/components/dashboard/check-in-sheet";
import { ShareCheckInSheetContent } from "@/components/dashboard/share-check-in-content";

interface UseShareCheckInSheetOptions {
  /** 任務標題 */
  taskTitle: string;
  /** 打卡資料 */
  checkInData: CheckInData & {
    date: string;
    images?: string[];
  };
  /** 關閉時的回調 */
  onClose?: () => void;
}

/**
 * 使用全局 SheetManager 來顯示分享打卡 Sheet 的 Hook
 *
 * @example
 * ```tsx
 * const { openShareSheet } = useShareCheckInSheet({
 *   taskTitle: "我的實踐",
 *   checkInData: { ... },
 *   onClose: handleClose,
 * });
 *
 * // 當需要顯示 Sheet 時
 * openShareSheet();
 * ```
 */
export function useShareCheckInSheet({
  taskTitle,
  checkInData,
  onClose,
}: UseShareCheckInSheetOptions) {
  const { open } = useSheetManager();

  const openShareSheet = useCallback(() => {
    open({
      title: "分享",
      description: "分享你的打卡記錄",
      content: (
        <ShareCheckInSheetContent
          taskTitle={taskTitle}
          checkInData={checkInData}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
      onClose,
    });
  }, [taskTitle, checkInData, onClose, open]);

  return { openShareSheet };
}
