"use client";

import {
  DesktopBannerSvg,
  desktopIntersectMaskDataUri,
  MobileBannerSvg,
  mobileIntersectMaskDataUri,
} from "@daodao/assets";
import { getLatestQuizResult } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { resultDetailMap } from "@daodao/features-quiz";
import { cn } from "@daodao/ui/lib/utils";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";

const resultTypeToLottiePathMap = new Map<string, () => Promise<object>>([
  ["D", () => import("@daodao/assets/images/quiz/deep-explorer-2.json").then((m) => m.default)],
  ["O", () => import("@daodao/assets/images/quiz/order-builder-2.json").then((m) => m.default)],
  ["A", () => import("@daodao/assets/images/quiz/active-shaper-2.json").then((m) => m.default)],
  ["L", () => import("@daodao/assets/images/quiz/liquid-integrator-2.json").then((m) => m.default)],
  ["C", () => import("@daodao/assets/images/quiz/community-connector-2.json").then((m) => m.default)],
]);

// 預設的 slogan（當無測驗結果時使用）
const DEFAULT_SLOGAN = "先做再說，做中學最快！";

export function Banner() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [resultType, setResultType] = useState<string | null>(null);
  const [lottieJson, setLottieJson] = useState<object | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(true);

  // 獲取用戶的測驗結果
  useEffect(() => {
    const fetchQuizResult = async () => {
      if (!isAuthenticated || isAuthLoading) {
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
              const defaultData = await defaultLoader();
              setLottieJson(defaultData);
            }
          }
        }
      }
    };

    if (!isLoadingResult) {
      loadLottie();
    }
  }, [resultType, isLoadingResult]);

  // 獲取對應的 slogan
  const slogan = resultType
    ? resultDetailMap.get(resultType)?.slogan || DEFAULT_SLOGAN
    : DEFAULT_SLOGAN;
  return (
    <>
      <header
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
        <h1
          className={cn(
            "absolute left-1/2 -translate-x-1/2 text-text-dark font-medium pointer-events-auto",
            "top-[26px] text-[1.125rem] sm:text-[1.75rem]",
            "md:top-[calc(3/13*100%)] md:-translate-y-full md:text-[1.75rem]"
          )}
        >
          我的小島
        </h1>
        <h2
          className={cn(
            "absolute left-1/2 -translate-x-1/2 max-w-[540px] min-w-44 w-1/2",
            "flex items-center justify-center pointer-events-auto",
            "bg-white/70 rounded-full text-text-dark border border-white",
            "bottom-[70%] -translate-y-full h-7 text-sm",
            "md:top-[42%] md:-translate-y-full md:h-10 md:text-[1.125rem]"
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
