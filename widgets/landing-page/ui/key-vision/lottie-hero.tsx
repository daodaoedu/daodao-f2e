'use client';

import { useEffect, useRef } from 'react';
import { type AnimationItem } from 'lottie-web';
import useMediaQuery from '@/hooks/useMediaQuery';

type Props = {
  desktopSrc: string; // e.g. "/assets/landing-page/key-vision-desktop.json"
  mobileSrc: string; // e.g. "/assets/landing-page/key-vision-mobile.json"
  preserveAspectRatio?: string; // 預設 "xMidYMid meet"
};

export function LottieHero({
  desktopSrc,
  mobileSrc,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const isMobile = !useMediaQuery('isMedium');

  useEffect(() => {
    // 尊重使用者偏好：減少動態
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const loadLottie = async () => {
      if (!containerRef.current) {
        return;
      }

      const lottie = (await import('lottie-web')).default;

      // 先清掉上一個動畫（避免疊加）
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }

      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        path: isMobile ? mobileSrc : desktopSrc,
        renderer: 'svg',
        loop: !prefersReduced,
        autoplay: !prefersReduced,
        name: 'KeyVision',
        rendererSettings: { preserveAspectRatio },
      });

      if (prefersReduced && animRef.current) {
        // 若使用者要求減少動態，停在第一幀
        animRef.current.goToAndStop(0, true);
      }
    };

    loadLottie();

    return () => {
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
    // 依賴 isMobile / 路徑變動時重載
  }, [isMobile, desktopSrc, mobileSrc, preserveAspectRatio]);

  return (
    <div
      ref={containerRef}
      className="aspect-[564/396] w-full md:aspect-[498/320]"
      aria-hidden="true"
    />
  );
}
