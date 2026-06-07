"use client";

import { useTranslations } from "@daodao/i18n";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { useCallback, useRef } from "react";
import type { CheckInData } from "@/components/check-in";
import { CheckInSheetContent } from "@/components/check-in";

interface IUseCheckInSheetOptions {
  /** 任務標題 */
  taskTitle: string;
  /** 打卡完成回調 */
  onComplete: (data: CheckInData) => Promise<void> | void;
  /** 關閉時的回調 */
  onClose?: () => void;
  /** 最近一次打卡的筆記（Harness: pre-check-in ritual） */
  lastCheckInNote?: string | null;
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
export function useCheckInSheet({
  taskTitle,
  onComplete,
  onClose,
  lastCheckInNote,
}: IUseCheckInSheetOptions) {
  const t = useTranslations("check_in");
  const { open } = useSheetManager();
  const closeRef = useRef<(() => void) | null>(null);

  const openCheckInSheet = useCallback(() => {
    const { close } = open({
      title: t("sheet_title"),
      description: t("sheet_description"),
      content: (
        <CheckInSheetContent
          taskTitle={taskTitle}
          lastCheckInNote={lastCheckInNote}
          onComplete={async (data) => {
            // 先關閉 sheet
            closeRef.current?.();
            // 然後執行 onComplete（會顯示 loading 和成功對話框）
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
  }, [taskTitle, onComplete, onClose, open, t]);

  return { openCheckInSheet };
}
