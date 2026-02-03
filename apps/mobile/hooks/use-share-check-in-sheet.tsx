import { useCallback, useState } from "react";
import type { CheckInData } from "../types";

interface ShareCheckInData extends CheckInData {
  date: string;
  images?: string[];
}

interface UseShareCheckInSheetOptions {
  /** 任務標題 */
  taskTitle: string;
  /** 打卡資料 */
  checkInData: ShareCheckInData;
  /** 關閉時的回調 */
  onClose?: () => void;
}

interface UseShareCheckInSheetReturn {
  /** 是否顯示分享 Sheet */
  isOpen: boolean;
  /** 打開分享 Sheet */
  openShareSheet: () => void;
  /** 關閉分享 Sheet */
  closeShareSheet: () => void;
}

/**
 * 管理分享打卡 Sheet 狀態的 Hook
 *
 * @example
 * ```tsx
 * const { isOpen, openShareSheet, closeShareSheet } = useShareCheckInSheet({
 *   taskTitle: "我的實踐",
 *   checkInData: { ... },
 *   onClose: handleClose,
 * });
 *
 * // 在 UI 中使用
 * <Button onPress={openShareSheet}>分享</Button>
 * <ShareCheckInSheet
 *   open={isOpen}
 *   onOpenChange={(open) => !open && closeShareSheet()}
 *   taskTitle={taskTitle}
 *   checkInData={checkInData}
 * />
 * ```
 */
export function useShareCheckInSheet({
  onClose,
}: UseShareCheckInSheetOptions): UseShareCheckInSheetReturn {
  const [isOpen, setIsOpen] = useState(false);

  const openShareSheet = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeShareSheet = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  return {
    isOpen,
    openShareSheet,
    closeShareSheet,
  };
}
