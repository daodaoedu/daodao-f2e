import { useCallback, useEffect, useRef } from 'react';

interface ScrollRestore {
  originalOverflow: string;
  originalPosition: string;
  originalTop: string;
  originalWidth: string;
  originalScrollY: number;
}

/**
 * 鎖定頁面滾動的 hook
 * 當組件掛載時鎖定滾動，卸載時自動恢復
 */
export function useScrollLock() {
  const scrollRestoreRef = useRef<ScrollRestore | null>(null);

  const lockScroll = useCallback(() => {
    const originalStyle = window.getComputedStyle(document.body);

    scrollRestoreRef.current = {
      originalOverflow: originalStyle.overflow,
      originalPosition: originalStyle.position,
      originalTop: originalStyle.top,
      originalWidth: originalStyle.width,
      originalScrollY: window.scrollY,
    };

    const { originalScrollY } = scrollRestoreRef.current;

    // 鎖定滾動
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${originalScrollY}px`;
    document.body.style.width = '100%';
  }, []);

  const unlockScroll = useCallback(() => {
    if (scrollRestoreRef.current) {
      const {
        originalOverflow,
        originalPosition,
        originalTop,
        originalWidth,
        originalScrollY,
      } = scrollRestoreRef.current;

      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, originalScrollY);

      scrollRestoreRef.current = null;
    }
  }, []);

  useEffect(() => {
    lockScroll();

    return () => {
      unlockScroll();
    };
  }, [lockScroll, unlockScroll]);

  return { lockScroll, unlockScroll };
}
