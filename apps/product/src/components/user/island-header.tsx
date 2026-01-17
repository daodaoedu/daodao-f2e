"use client";

import activeShaper1Json from "@daodao/assets/images/quiz/active-shaper-1.json";
import userDesktopBannerPng from "@daodao/assets/images/users/user-desktop-banner.png";
import userMobileBannerPng from "@daodao/assets/images/users/user-mobile-banner.png";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lottie from "lottie-react";
import { ChevronRight, RefreshCcw } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface IslandHeaderProps {
  children: React.ReactNode;
  learningType: string;
  onRetakeQuiz?: () => void;
  onViewDetails?: () => void;
}

/**
 * 「我的小島」標題區組件
 */
export function IslandHeader({
  children,
  learningType,
  onRetakeQuiz,
  onViewDetails,
}: IslandHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const originalBackgroundColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#B8E8FD";

    return () => {
      document.body.style.backgroundColor = originalBackgroundColor;
    };
  }, []);

  useEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return;

    const threshold = 167;
    const minOpacity = 0.3;

    // 創建動畫時間軸，從 opacity 1 到 opacity 0.3
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: `${threshold}px top`,
        scrub: 0.3, // 0.3 秒的緩衝時間，讓動畫更流暢
        invalidateOnRefresh: true,
      },
    });

    // 設置動畫：從 opacity 1 到 opacity 0.3
    tl.to(headerElement, {
      opacity: minOpacity,
      ease: "none",
    });

    // 設置初始 opacity
    gsap.set(headerElement, { opacity: 1 });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        const vars = trigger.vars as { trigger?: string };
        if (vars.trigger === "body") {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <>
      <div className="h-[378px] md:h-[333px] relative -z-20" />
      <header ref={headerRef} className="fixed top-0 inset-x-0 h-[420px] -z-10">
        <Image
          src={userDesktopBannerPng}
          alt="user-desktop-banner"
          fill
          className="hidden md:block object-cover"
        />
        <Image
          src={userMobileBannerPng}
          alt="user-desktop-banner"
          fill
          className="md:hidden object-cover"
        />
        {children}
        <div className="absolute left-1/2 top-[92px] md:top-[127px] -translate-x-1/2 w-[149px] h-[140px] md:w-[168px] md:h-[158px]">
          <Lottie animationData={activeShaper1Json} className="*:w-full *:h-full" />
          <div className="hidden md:block absolute bottom-[25px] -left-[5px] w-3 h-[11px] rounded-full bg-white/70 border border-light-cyan" />
          <div className="hidden md:block absolute bottom-[35px] -left-[22px] size-4.5 rounded-full bg-white/70 border border-light-cyan" />
          <div className="absolute -bottom-[126px] left-1/2 -translate-x-1/2 w-[calc(100vw-40px)] md:translate-x-0 md:bottom-[37px] md:-left-[241px] md:w-[219px] rounded-[20px] bg-white/70 py-3 px-4 border border-light-cyan">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-logo-cyan font-medium">學習類型</p>
              <Button
                variant="ghost"
                className="group text-text-dark text-xs p-0 h-auto"
                onClick={onRetakeQuiz}
              >
                <RefreshCcw className="size-4.5 text-light-gray group-hover:animate-spin-reverse" />
                重新測驗
              </Button>
            </div>
            <p className="text-text-dark font-medium mb-2">{learningType}</p>
            <Button variant="orange" className="w-full" onClick={onViewDetails}>
              觀看詳細說明
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
