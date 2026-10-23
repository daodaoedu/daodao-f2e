"use client";

import { useTranslations } from "@daodao/i18n";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { useCallback, useRef } from "react";
import type { CheckInData } from "@/components/check-in";
import { CheckInSheetContent } from "@/components/check-in";
import {
  createSheetCompleteHandler,
  type ICheckInSheetHelpers,
} from "@/components/check-in/form/check-in-submit-flow";

interface IUseCheckInSheetOptions {
  /** 任務標題 */
  taskTitle: string;
  /**
   * 打卡送出回調。成功時呼叫 `closeSheet` 關閉 sheet；失敗時丟出錯誤，sheet 與已填內容會保留。
   */
  onComplete: (data: CheckInData, helpers: ICheckInSheetHelpers) => Promise<void> | void;
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
 *   // 送出成功後呼叫 closeSheet；失敗時丟出錯誤，sheet 與內容保留
 *   onComplete: async (data, { closeSheet }) => {
 *     await createCheckIn(data);
 *     closeSheet();
 *   },
 *   onClose: handleClose,
 * });
 *
 * // 當需要顯示 Sheet 時
 * openCheckInSheet();
 * ```
 */
export function useCheckInSheet({ taskTitle, onComplete, onClose }: IUseCheckInSheetOptions) {
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
          // 不先關 sheet：由 onComplete 在建立成功後呼叫 closeSheet，失敗時 sheet 與內容保留（daodao#377）
          onComplete={createSheetCompleteHandler(onComplete, () => closeRef.current)}
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
