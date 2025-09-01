'use client';

import { useEffect, useRef, useState } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';

type Props = {
  desktopSrc: string;   // e.g. "/img/key-vision-desktop.json"
  mobileSrc: string;    // e.g. "/img/key-vision-mobile.json"
  breakpoint?: number;  // 切換門檻，預設 768
  className?: string;   // 可傳入 "lottie-animation"
  preserveAspectRatio?: string; // 預設 "xMidYMid meet"
};

export default function LottieHero({
  desktopSrc,
  mobileSrc,
  breakpoint = 768,
  className,
  preserveAspectRatio = 'xMidYMid meet',
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < breakpoint);

  useEffect(() => {
    // 尊重使用者偏好：減少動態
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const load = () => {
      if (!containerRef.current) return;

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

    load();

    // 視窗尺寸改變時，若跨越 breakpoint 才重新載入動畫（避免每次 resize 都重載）
    let lastMobile = isMobile;
    const onResize = () => {
      const nowMobile = window.innerWidth < breakpoint;
      if (nowMobile !== lastMobile) {
        lastMobile = nowMobile;
        setIsMobile(nowMobile);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
    // 依賴 isMobile / 路徑變動時重載
  }, [isMobile, desktopSrc, mobileSrc, breakpoint, preserveAspectRatio]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      // 你可以用 CSS 控寬高，這裡放個最小高度避免版面塌陷
      style={{ minHeight: 240 }}
    />
  );
}
