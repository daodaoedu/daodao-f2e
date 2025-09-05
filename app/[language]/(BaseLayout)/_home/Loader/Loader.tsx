'use client';

import { useEffect, useState, useRef } from 'react';
import './Loader.css';

interface LoaderProps {
  onComplete?: () => void;
}

export function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0.05); // 設置初始值為 5% 確保可見
  const [isLoading, setIsLoading] = useState(true);
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

    // Progress animation
    const duration = 3500; // 3.5 seconds
    const startTime = performance.now();

    const animateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const currentProgress = Math.min(1, elapsed / duration);
      
      // easeOutCubic
      const eased = 1 - (1 - currentProgress) ** 3;
      setProgress(eased);
      console.log('Progress updated:', eased, 'Percentage:', Math.round(eased * 100));

      if (currentProgress < 1) {
        requestAnimationFrame(animateProgress);
      } else {
        // Animation complete
        setTimeout(() => {
          setIsLoading(false);
          onComplete?.();
        }, 150);
      }
    };

    requestAnimationFrame(animateProgress);

    return () => {
      if (lottieAnimationRef.current) {
        lottieAnimationRef.current.destroy();
      }
    };
  }, [onComplete]);

  if (!isLoading) return null;

  return (
    <div className="loader">
      <div className="loader__center">
        <div ref={lottieContainerRef} className="loader__logo" />
      </div>

      <div className="loader__bottom">
        <div className="loader__percent">{Math.round(progress * 100)}%</div>
        <div className="loader__track">
          <div 
            className="loader__bar" 
            style={{ 
              width: `${Math.min(progress * 100, 100)}%`,
              backgroundColor: '#16B9B3',
              height: '100%',
            }}
           />
        </div>
      </div>
    </div>
  );
}
