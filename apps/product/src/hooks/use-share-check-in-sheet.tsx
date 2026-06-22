"use client";

import { useTranslations } from "@daodao/i18n";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { useCallback } from "react";
import type { CheckInData } from "@/components/check-in";
import { ShareCheckInSheetContent } from "@/components/check-in";

interface IUseShareCheckInSheetOptions {
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
}: IUseShareCheckInSheetOptions) {
  const t = useTranslations("check_in");
  const { open } = useSheetManager();

  const openShareSheet = useCallback(() => {
    open({
      title: t("share_sheet_title"),
      description: t("share_sheet_description"),
      content: <ShareCheckInSheetContent taskTitle={taskTitle} checkInData={checkInData} />,
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
      onClose,
    });
  }, [taskTitle, checkInData, onClose, open, t]);

  return { openShareSheet };
}
