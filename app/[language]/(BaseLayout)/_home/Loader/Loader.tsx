'use client';

import { useEffect, useRef } from 'react';
import { usePreloadImages } from '@/hooks/usePreloadImages';

interface LoaderProps {
  onComplete?: () => void;
}

export function Loader({ onComplete }: LoaderProps) {
  const { progress, done } = usePreloadImages('img[data-preload], video[data-preload]');
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const lottieAnimationRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    // Load Lottie animation
    const loadLottie = async () => {
      try {
        const lottie = await import('lottie-web');
        if (lottieContainerRef.current) {
          lottieAnimationRef.current = lottie.default.loadAnimation({
            container: lottieContainerRef.current,
            path: '/assets/landing-page/logo-action.json',
            renderer: 'svg',
            loop: true,
            autoplay: true,
            name: 'Loader',
            rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
          });
        }
      } catch (error) {
        console.error('Failed to load Lottie animation:', error);
      }
    };

    loadLottie();

    return () => {
      if (lottieAnimationRef.current) {
        lottieAnimationRef.current.destroy();
      }
    };
  }, []);

  // 當圖片載入完成時觸發完成回調
  useEffect(() => {
    if (done) {
      setTimeout(() => {
        onComplete?.();
      }, 150);
    }
  }, [done, onComplete]);

  if (done) return null;

  return (
    <div className="fixed inset-0 bg-primary-palest grid grid-rows-[1fr_auto] z-[9999]">
      <div className="grid place-items-center">
        <div ref={lottieContainerRef} className="w-[140px] h-[140px]" />
      </div>

      <div className="pb-6">
        <div className="text-[50px] font-semibold px-6 text-primary-base mb-2">
          {Math.round(progress * 100)}%
        </div>
        <div className="relative h-2 bg-primary-lightest overflow-hidden">
          <div 
            className="h-full bg-primary-base transition-[width] duration-200 ease-in-out"
            style={{ 
              width: `${Math.min(progress * 100, 100)}%`,
            }}
           />
        </div>
      </div>
    </div>
  );
}
