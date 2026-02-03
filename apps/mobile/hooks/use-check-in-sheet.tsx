import { useCallback, useState } from "react";
import type { CheckInData } from "@/types";

interface UseCheckInSheetOptions {
  /** 任務標題 */
  taskTitle: string;
  /** 打卡完成回調 */
  onComplete: (data: CheckInData) => Promise<void> | void;
  /** 關閉時的回調 */
  onClose?: () => void;
}

interface UseCheckInSheetReturn {
  /** 是否顯示打卡 Sheet */
  isOpen: boolean;
  /** 打開打卡 Sheet */
  openCheckInSheet: () => void;
  /** 關閉打卡 Sheet */
  closeCheckInSheet: () => void;
  /** 處理打卡完成 */
  handleComplete: (data: CheckInData) => Promise<void>;
}

/**
 * 管理打卡 Sheet 狀態的 Hook
 *
 * @example
 * ```tsx
 * const { isOpen, openCheckInSheet, closeCheckInSheet, handleComplete } = useCheckInSheet({
 *   taskTitle: "我的實踐",
 *   onComplete: handleCheckIn,
 *   onClose: handleClose,
 * });
 *
 * // 在 UI 中使用
 * <Button onPress={openCheckInSheet}>打卡</Button>
 * <CheckInSheet
 *   open={isOpen}
 *   onOpenChange={(open) => !open && closeCheckInSheet()}
 *   onComplete={handleComplete}
 * />
 * ```
 */
export function useCheckInSheet({
  onComplete,
  onClose,
}: UseCheckInSheetOptions): UseCheckInSheetReturn {
  const [isOpen, setIsOpen] = useState(false);

  const openCheckInSheet = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCheckInSheet = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const handleComplete = useCallback(
    async (data: CheckInData) => {
      // 先關閉 sheet
      setIsOpen(false);
      // 然後執行 onComplete
      await onComplete(data);
    },
    [onComplete]
  );

  return {
    isOpen,
    openCheckInSheet,
    closeCheckInSheet,
    handleComplete,
  };
}
