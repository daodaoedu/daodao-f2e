"use client";

import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { useCallback, useRef } from "react";
import type { CheckInData } from "@/components/dashboard/check-in-sheet";
import { CheckInSheetContent } from "@/components/dashboard/check-in-sheet";

interface UseCheckInSheetOptions {
  /** 任務標題 */
  taskTitle: string;
  /** 打卡完成回調 */
  onComplete: (data: CheckInData) => void;
  /** 關閉時的回調 */
  onClose?: () => void;
}

/**
 * 使用全局 SheetManager 來顯示打卡 Sheet 的 Hook
 *
 * @example
 * ```tsx
 * const { openCheckInSheet } = useCheckInSheet({
 *   taskTitle: "我的實踐",
 *   onComplete: handleComplete,
 *   onClose: handleClose,
 * });
 *
 * // 當需要顯示 Sheet 時
 * openCheckInSheet();
 * ```
 */
export function useCheckInSheet({ taskTitle, onComplete, onClose }: UseCheckInSheetOptions) {
  const { open } = useSheetManager();
  const closeRef = useRef<(() => void) | null>(null);

  const openCheckInSheet = useCallback(() => {
    const { close } = open({
      title: "打卡",
      description: "記錄你的學習進度和心情",
      content: (
        <CheckInSheetContent
          taskTitle={taskTitle}
          onComplete={(data) => {
            onComplete(data);
            closeRef.current?.();
          }}
          onClose={() => {
            closeRef.current?.();
            onClose?.();
          }}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
      onClose: onClose,
    });
    closeRef.current = close;
  }, [taskTitle, onComplete, onClose, open]);

  return { openCheckInSheet };
}
