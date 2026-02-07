"use client";

import { useCallback, useState } from "react";

/**
 * 追蹤輸入法組合狀態的 hook
 * 用於避免在中文輸入法選字時誤觸發 Enter 鍵事件
 *
 * @returns 返回 isComposing 狀態和 composition 事件處理函數
 *
 * @example
 * ```tsx
 * const { isComposing, compositionProps } = useCompositionState();
 *
 * <Input
 *   {...compositionProps}
 *   onKeyDown={(e) => {
 *     if (e.key === "Enter" && !isComposing) {
 *       handleSubmit();
 *     }
 *   }}
 * />
 * ```
 */
export function useCompositionState() {
  const [isComposing, setIsComposing] = useState(false);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  return {
    isComposing,
    compositionProps: {
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
    },
  };
}
