import { useCallback, useState } from "react";

interface TagEditData {
  tags: string[];
  keyword: string;
}

interface UseTagEditSheetOptions {
  /** 初始標籤 */
  initialTags?: string[];
  /** 初始關鍵字 */
  initialKeyword?: string;
  /** 完成回調 */
  onComplete: (data: TagEditData) => void;
  /** 關閉時的回調 */
  onClose?: () => void;
}

interface UseTagEditSheetReturn {
  /** 是否顯示編輯標籤 Sheet */
  isOpen: boolean;
  /** 打開編輯標籤 Sheet */
  openTagEditSheet: () => void;
  /** 關閉編輯標籤 Sheet */
  closeTagEditSheet: () => void;
  /** 處理完成 */
  handleComplete: (data: TagEditData) => void;
}

/**
 * 管理編輯標籤 Sheet 狀態的 Hook
 *
 * @example
 * ```tsx
 * const { isOpen, openTagEditSheet, closeTagEditSheet, handleComplete } = useTagEditSheet({
 *   initialTags: ["標籤1", "標籤2"],
 *   initialKeyword: "關鍵字",
 *   onComplete: handleComplete,
 *   onClose: handleClose,
 * });
 *
 * // 在 UI 中使用
 * <Button onPress={openTagEditSheet}>編輯標籤</Button>
 * <TagEditSheet
 *   open={isOpen}
 *   onOpenChange={(open) => !open && closeTagEditSheet()}
 *   onComplete={handleComplete}
 * />
 * ```
 */
export function useTagEditSheet({
  onComplete,
  onClose,
}: UseTagEditSheetOptions): UseTagEditSheetReturn {
  const [isOpen, setIsOpen] = useState(false);

  const openTagEditSheet = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeTagEditSheet = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const handleComplete = useCallback(
    (data: TagEditData) => {
      setIsOpen(false);
      onComplete(data);
    },
    [onComplete]
  );

  return {
    isOpen,
    openTagEditSheet,
    closeTagEditSheet,
    handleComplete,
  };
}
