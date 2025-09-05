import { useCallback } from 'react';

/**
 * 平滑捲動到指定元素的 hook
 * @returns 平滑捲動函數
 */
export function useSmoothScroll() {
  const scrollToElement = useCallback((targetId: string, offset: number = 0) => {
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const targetPosition = targetElement.offsetTop - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return {
    scrollToElement,
    scrollToTop,
  };
}
