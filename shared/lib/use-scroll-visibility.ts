import { useEffect, useState } from 'react';

interface UseScrollVisibilityOptions {
  threshold?: number;
}

export function useScrollVisibility(options: UseScrollVisibilityOptions = {}) {
  const { threshold = 0 } = options;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number;
    let isScheduled = false;

    const updateVisibility = () => {
      const { scrollY } = window;
      const shouldBeVisible = scrollY > threshold;
      setIsVisible(shouldBeVisible);
      isScheduled = false;
    };

    const handleScroll = () => {
      if (!isScheduled) {
        isScheduled = true;
        rafId = requestAnimationFrame(updateVisibility);
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [threshold]);

  return isVisible;
}
