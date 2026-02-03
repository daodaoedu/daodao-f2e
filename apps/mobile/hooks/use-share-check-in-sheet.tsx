import { useCallback, useState } from "react";

interface UseShareCheckInSheetOptions {
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
 *   onClose: handleClose,
 * });
 *
 * // 在 UI 中使用
 * <Button onPress={openShareSheet}>分享</Button>
 * <ShareCheckInSheet
 *   open={isOpen}
 *   onOpenChange={(open) => !open && closeShareSheet()}
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
