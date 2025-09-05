import { useEffect, useState } from 'react';

interface UseScrollVisibilityOptions {
  threshold?: number; // 捲動閾值，預設為 100px
  debounceMs?: number; // 防抖延遲，預設為 16ms (60fps)
}

export function useScrollVisibility(options: UseScrollVisibilityOptions = {}) {
  const { threshold = 100, debounceMs = 16 } = options;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      // 清除之前的 timeout
      clearTimeout(timeoutId);
      
      // 設置新的 timeout 來防抖
      timeoutId = setTimeout(() => {
        const {scrollY} = window;
        const shouldBeVisible = scrollY > threshold;
        
        setIsVisible(shouldBeVisible);
      }, debounceMs);
    };

    // 初始化狀態
    handleScroll();

    // 添加捲動監聽器
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 清理函數
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [threshold, debounceMs]);

  return isVisible;
}
