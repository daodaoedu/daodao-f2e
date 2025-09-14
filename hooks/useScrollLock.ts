import { useEffect, useRef } from 'react';

/**
 * 鎖定頁面滾動的 hook
 * 當組件掛載時鎖定滾動，卸載時自動恢復
 */
export function useScrollLock() {
  const scrollRestoreRef = useRef<{
    originalStyle: string;
    originalScrollY: number;
  } | null>(null);

  useEffect(() => {
    // 保存原始樣式和滾動位置
    scrollRestoreRef.current = {
      originalStyle: window.getComputedStyle(document.body).overflow,
      originalScrollY: window.scrollY,
    };

    const { originalStyle, originalScrollY } = scrollRestoreRef.current;

    // 鎖定滾動
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${originalScrollY}px`;
    document.body.style.width = '100%';

    return () => {
      // 恢復滾動
      if (scrollRestoreRef.current) {
        document.body.style.overflow = scrollRestoreRef.current.originalStyle;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollRestoreRef.current.originalScrollY);
        scrollRestoreRef.current = null;
      }
    };
  }, []);

  // 手動解鎖滾動的函數
  const unlockScroll = () => {
    if (scrollRestoreRef.current) {
      const { originalStyle, originalScrollY } = scrollRestoreRef.current;
      
      document.body.style.overflow = originalStyle;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, originalScrollY);
      
      scrollRestoreRef.current = null;
    }
  };

  return { unlockScroll };
}
