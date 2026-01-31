"use client";

import { useCallback, useEffect, useRef } from "react";

interface ScrollRestore {
  originalOverflow: string;
  originalPosition: string;
  originalTop: string;
  originalScrollY: number;
}

/**
 * 鎖定頁面滾動的 hook
 * @param enabled - 是否啟用滾動鎖定，預設為 true（組件掛載時自動鎖定）
 * @returns 返回 lockScroll 和 unlockScroll 函數，可手動控制滾動鎖定
 */
export function useScrollLock(enabled: boolean = true) {
  const scrollRestoreRef = useRef<ScrollRestore | null>(null);

  const lockScroll = useCallback(() => {
    // 如果已經鎖定，不重複鎖定
    if (scrollRestoreRef.current) {
      return;
    }

    const originalStyle = window.getComputedStyle(document.body);

    scrollRestoreRef.current = {
      originalOverflow: originalStyle.overflow,
      originalPosition: originalStyle.position,
      originalTop: originalStyle.top,
      originalScrollY: window.scrollY,
    };

    const { originalScrollY } = scrollRestoreRef.current;

    // 鎖定滾動
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${originalScrollY}px`;
  }, []);

  const unlockScroll = useCallback(() => {
    if (scrollRestoreRef.current) {
      const { originalOverflow, originalPosition, originalTop, originalScrollY } =
        scrollRestoreRef.current;

      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      window.scrollTo(0, originalScrollY);

      scrollRestoreRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      lockScroll();
    }

    return () => {
      if (enabled) {
        unlockScroll();
      }
    };
  }, [enabled, lockScroll, unlockScroll]);

  return { lockScroll, unlockScroll };
}
