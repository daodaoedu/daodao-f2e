"use client";

import { getLatestQuizResult } from "@daodao/api";
import {
  DesktopBannerSvg,
  desktopIntersectMaskDataUri,
  MobileBannerSvg,
  mobileIntersectMaskDataUri,
} from "@daodao/assets";
import { useAuth } from "@daodao/auth";
import { resultDetailMap } from "@daodao/features-quiz";
import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lottie from "lottie-react";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const resultTypeToLottiePathMap = new Map<string, () => Promise<object>>([
  ["D", () => import("@daodao/assets/images/quiz/deep-explorer-2.json").then((m) => m.default)],
  ["O", () => import("@daodao/assets/images/quiz/order-builder-2.json").then((m) => m.default)],
  ["A", () => import("@daodao/assets/images/quiz/active-shaper-2.json").then((m) => m.default)],
  ["L", () => import("@daodao/assets/images/quiz/liquid-integrator-2.json").then((m) => m.default)],
  [
    "C",
    () => import("@daodao/assets/images/quiz/community-connector-2.json").then((m) => m.default),
  ],
]);

export function Banner() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const t = useTranslations("layout");
  const [resultType, setResultType] = useState<string | null>(null);
  const [lottieJson, setLottieJson] = useState<object | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(true);

  // 獲取用戶的測驗結果
  useEffect(() => {
    const fetchQuizResult = async () => {
      if (isAuthLoading) {
        return;
      }
      if (!isAuthenticated) {
        setIsLoadingResult(false);
        return;
      }

      try {
        const response = await getLatestQuizResult();
        if (response.data?.data?.resultType) {
          setResultType(response.data.data.resultType.toUpperCase());
        }
      } catch (error) {
        console.error("Failed to fetch quiz result:", error);
      } finally {
        setIsLoadingResult(false);
      }
    };

    fetchQuizResult();
  }, [isAuthenticated, isAuthLoading]);

  // 根據結果類型動態加載 Lottie 動畫
  useEffect(() => {
    const loadLottie = async () => {
      const type = resultType || "A"; // 預設使用動動島 (A)
      const loader = resultTypeToLottiePathMap.get(type);
      if (loader) {
        try {
          const data = await loader();
          setLottieJson(data);
        } catch (error) {
          console.error("Failed to load Lottie animation:", error);
          // 如果加載失敗，嘗試加載預設的動動島
          if (type !== "A") {
            const defaultLoader = resultTypeToLottiePathMap.get("A");
            if (defaultLoader) {
              try {
                const defaultData = await defaultLoader();
                setLottieJson(defaultData);
              } catch (fallbackError) {
                console.error("Failed to load fallback Lottie animation:", fallbackError);
              }
            }
          }
        }
      }
    };

    if (!isLoadingResult) {
      loadLottie();
    }
  }, [resultType, isLoadingResult]);

  // ── 滾動漸淡（和我的小島頁面一樣） ──
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return;

    const threshold = 167;
    const minOpacity = 0.3;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: `${threshold}px top`,
        scrub: 0.3,
        invalidateOnRefresh: true,
      },
    });

    tl.to(headerElement, {
      opacity: minOpacity,
      ease: "none",
    });

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

  // 獲取對應的 slogan
  const slogan = resultType
    ? resultDetailMap.get(resultType)?.slogan || t("default_slogan")
    : t("default_slogan");
  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 right-0 left-0 z-20 pointer-events-none mask-luminance mask-intersect"
        )}
        style={
          {
            "--mobile-intersect-mask": `url("${mobileIntersectMaskDataUri}")`,
            "--desktop-intersect-mask": `url("${desktopIntersectMaskDataUri}")`,
          } as React.CSSProperties
        }
      >
        <MobileBannerSvg className="md:hidden w-full" />
        <DesktopBannerSvg className="hidden md:block w-full" />
        <h2
          className={cn(
            "absolute left-1/2 -translate-x-1/2 max-w-[80%]",
            "flex items-center justify-center pointer-events-auto",
            "bg-white/70 rounded-full text-text-dark border border-white px-6 py-1.5",
            "bottom-[70%] -translate-y-full text-sm",
            "md:top-[42%] md:-translate-y-full md:w-[540px] md:h-[40px] md:text-[1.125rem]"
          )}
        >
          {slogan}
          {lottieJson && (
            <>
              <div className="md:hidden absolute -bottom-8 left-full w-24 rotate-3">
                <Lottie animationData={lottieJson} className="*:w-full *:h-full" />
              </div>
              <div className="hidden md:block absolute top-4 -right-[27px] size-4.5 rounded-full bg-white/70 border border-white">
                <div className="absolute -bottom-[11px] -right-3 w-3 h-[11px] rounded-full bg-white/70 border border-white">
                  <div className="absolute -bottom-[30px] left-full w-32 lg:w-[168px] rotate-3">
                    <Lottie animationData={lottieJson} className="*:w-full *:h-full" />
                  </div>
                </div>
              </div>
            </>
          )}
        </h2>
      </header>

      <div className="aspect-195/73 md:aspect-16/3" />
    </>
  );
}
