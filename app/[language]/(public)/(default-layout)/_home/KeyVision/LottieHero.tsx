'use client';

import { useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import useMediaQuery from '@/hooks/useMediaQuery';

type Props = {
  desktopSrc: string;   // e.g. "/assets/landing-page/key-vision-desktop.json"
  mobileSrc: string;    // e.g. "/assets/landing-page/key-vision-mobile.json"
  preserveAspectRatio?: string; // 預設 "xMidYMid meet"
};

export default function LottieHero({
  desktopSrc,
  mobileSrc,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const isMobile = !useMediaQuery('isMedium');

  useEffect(() => {
    // 尊重使用者偏好：減少動態
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!containerRef.current) {
      return () => {
        // 空的 cleanup function
      };
    }

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
      className="min-h-[240px]"
      aria-hidden="true"
    />
  );
}
