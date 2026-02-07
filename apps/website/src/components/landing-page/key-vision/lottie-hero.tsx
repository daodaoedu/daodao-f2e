"use client";

import { useIsMobile } from "@daodao/shared";
import Lottie from "lottie-react";
import { useEffect, useMemo, useState } from "react";

export function LottieHero() {
  const isMobile = useIsMobile();
  const [animationData, setAnimationData] = useState<object | null>(null);

  // 動態載入動畫資料
  useEffect(() => {
    const loadAnimation = async () => {
      const path = isMobile
        ? "/assets/landing-page/key-vision-mobile.json"
        : "/assets/landing-page/key-vision-desktop.json";
      try {
        const response = await fetch(path);
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error("Failed to load Lottie animation:", error);
      }
    };

    loadAnimation();
  }, [isMobile]);

  // 尊重使用者偏好：減少動態
  const prefersReduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  if (!animationData) {
    return null;
  }

  return (
    <Lottie
      animationData={animationData}
      loop={!prefersReduced}
      autoplay={!prefersReduced}
      style={{ width: "100%", height: "100%" }}
      rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
      initialSegment={prefersReduced ? [0, 0] : undefined}
    />
  );
}
