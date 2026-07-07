"use client";

import userDesktopBannerPng from "@daodao/assets/images/users/user-desktop-banner.png";
import userMobileBannerPng from "@daodao/assets/images/users/user-mobile-banner.png";
import { useAuth } from "@daodao/auth";
import { getEnv } from "@daodao/config";
import { resultDetailMap, themeMap } from "@daodao/features-quiz";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lottie from "lottie-react";
import { ChevronRight, RefreshCcw } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { IslandWeatherLayer } from "../learning-life";
import { PageHeader, type PageHeaderProps } from "../layout/page-header";

gsap.registerPlugin(ScrollTrigger);

interface IslandHeaderProps {
  resultType: string;
  userId?: string;
}

const resultTypeToLottiePathMap = new Map<string, () => Promise<object>>([
  ["D", () => import("@daodao/assets/images/quiz/deep-explorer-1.json").then((m) => m.default)],
  ["O", () => import("@daodao/assets/images/quiz/order-builder-1.json").then((m) => m.default)],
  ["A", () => import("@daodao/assets/images/quiz/active-shaper-1.json").then((m) => m.default)],
  ["L", () => import("@daodao/assets/images/quiz/liquid-integrator-1.json").then((m) => m.default)],
  [
    "C",
    () => import("@daodao/assets/images/quiz/community-connector-1.json").then((m) => m.default),
  ],
]);
/**
 * 「我的小島」標題區組件
 */
export function IslandHeader({ resultType, userId }: IslandHeaderProps) {
  const t = useTranslations("app_product");
  const { user } = useAuth();
  const isOwnProfile = userId !== undefined && user?.id === userId;
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  const resultDetail = resultDetailMap.get(resultType);
  const theme = themeMap.get(resultType);
  const isEmptyResult = !resultDetail || !theme;
  const message = isEmptyResult
    ? t("user_empty_quiz_message")
    : t("user_quiz_message", { tag: resultDetail.tags[0] ?? "", title: theme.title });

  // 動態載入主要的 lottie 動畫（當有結果時，或沒結果時載入預設）
  const [lottieJson, setLottieJson] = useState<object | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isEmptyResult) {
      const loadLottie = resultTypeToLottiePathMap.get(resultType);
      if (loadLottie) {
        loadLottie()
          .then((data) => setLottieJson(data))
          .catch((error) => console.error("Failed to load Lottie animation:", error));
      }
    }
  }, [resultType, isEmptyResult]);

  // 動態載入所有 lottie 動畫（當沒有結果且是自己的個人頁面時，用於跑馬燈）
  const [allLotties, setAllLotties] = useState<Map<string, object>>(new Map());
  useEffect(() => {
    if (isEmptyResult && isOwnProfile && typeof window !== "undefined") {
      const loadAllLotties = async () => {
        const lottieMap = new Map<string, object>();
        const loadPromises = Array.from(resultTypeToLottiePathMap.entries()).map(
          async ([key, loadFn]) => {
            try {
              const data = await loadFn();
              lottieMap.set(key, data);
            } catch (error) {
              console.error(`Failed to load Lottie animation for ${key}:`, error);
            }
          }
        );
        await Promise.all(loadPromises);
        setAllLotties(lottieMap);
      };
      loadAllLotties();
    }
  }, [isEmptyResult, isOwnProfile]);

  const handleGoToQuiz = () => {
    router.push(`${getEnv("NEXT_PUBLIC_WEBSITE_URL")}/quiz`);
  };

  const handleGoToQuizDetail = () => {
    router.push(`${getEnv("NEXT_PUBLIC_WEBSITE_URL")}/quiz/result/${resultType}`);
  };

  const pageHeaderProps = useMemo<PageHeaderProps>(() => {
    if (isOwnProfile) {
      return {
        title: t("user_my_island"),
        rightAction: null,
      };
    }
    return { leftAction: "back", leftLabel: "" };
  }, [isOwnProfile, t]);

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
      <div
        className={cn(
          "relative -z-20",
          "h-[378px] md:h-[389px]",
          !isEmptyResult && "h-[378px] md:h-[333px]",
          isEmptyResult && !isOwnProfile && "h-[150px] md:h-[150px]"
        )}
      />
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
        <PageHeader {...pageHeaderProps} />
        {isEmptyResult && isOwnProfile && (
          <div className="absolute left-0 right-0 top-[150px] w-[600px] mx-auto overflow-hidden mask-marquee">
            <div className="animate-marquee flex w-max gap-3 will-change-transform">
              {/* 第一份內容 */}
              {Array.from(resultTypeToLottiePathMap.keys()).map((key) => {
                const animationData = allLotties.get(key);
                if (!animationData) return null;
                return (
                  <div key={key} className="w-[96px] h-[91px] shrink-0">
                    <Lottie animationData={animationData} className="*:w-full *:h-full" />
                  </div>
                );
              })}
              {/* 複製一次以實現無縫循環 */}
              {Array.from(resultTypeToLottiePathMap.keys()).map((key) => {
                const animationData = allLotties.get(key);
                if (!animationData) return null;
                return (
                  <div key={`duplicate-${key}`} className="w-[96px] h-[91px] shrink-0">
                    <Lottie animationData={animationData} className="*:w-full *:h-full" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="absolute left-1/2 top-[92px] md:top-[127px] -translate-x-1/2 w-[149px] h-[140px] md:w-[168px] md:h-[158px]">
          {lottieJson && <Lottie animationData={lottieJson} className="*:w-full *:h-full" />}
          {isOwnProfile && <IslandWeatherLayer />}
          {isOwnProfile && (
            <>
              <div
                className={cn(
                  "hidden md:block absolute bottom-[25px] -left-[5px] w-3 h-[11px] rounded-full bg-white/70 border border-light-cyan",
                  isEmptyResult && "left-[34px]"
                )}
              />
              <div
                className={cn(
                  "hidden md:block absolute bottom-[35px] -left-[22px] size-4.5 rounded-full bg-white/70 border border-light-cyan",
                  isEmptyResult && " left-[17px]"
                )}
              />
              <div
                className={cn(
                  "absolute -bottom-[126px] left-1/2 -translate-x-1/2 w-[calc(100vw-40px)] max-w-[600px] md:translate-x-0 md:bottom-[37px] md:-left-[241px] md:w-[219px] rounded-[20px] bg-white/70 py-3 px-4 border border-light-cyan",
                  isEmptyResult && "md:w-[258px]"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-logo-cyan font-medium">{t("user_learning_type")}</p>
                  {!isEmptyResult && (
                    <Button
                      variant="ghost"
                      className="group text-text-dark text-xs p-0 h-auto"
                      onClick={handleGoToQuiz}
                    >
                      <RefreshCcw className="size-4.5 text-light-gray group-hover:animate-spin-reverse" />
                      {t("user_retake_quiz")}
                    </Button>
                  )}
                </div>
                <p className="text-text-dark font-medium mb-2">{message}</p>
                <Button
                  variant="orange"
                  className="w-full"
                  onClick={isEmptyResult ? handleGoToQuiz : handleGoToQuizDetail}
                >
                  {isEmptyResult ? t("user_start_quiz") : t("user_view_details")}
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}
