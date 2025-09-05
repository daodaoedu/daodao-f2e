import { useState, useEffect, useCallback } from 'react';

interface UseCarouselOptions {
  autoPlay?: boolean;
  interval?: number;
  loop?: boolean;
  totalItems: number;
}

export function useCarousel({ 
  autoPlay = true, 
  interval = 5000, 
  loop = true, 
  totalItems, 
}: UseCarouselOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const next = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev === totalItems - 1) {
        return loop ? 0 : prev;
      }
      return prev + 1;
    });
  }, [totalItems, loop]);

  const prev = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev === 0) {
        return loop ? totalItems - 1 : prev;
      }
      return prev - 1;
    });
  }, [totalItems, loop]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < totalItems) {
      setCurrentIndex(index);
    }
  }, [totalItems]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying || !autoPlay) return;

    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [isPlaying, autoPlay, interval, next]);

  return {
    currentIndex,
    isPlaying,
    next,
    prev,
    goTo,
    pause,
    play,
  };
}
