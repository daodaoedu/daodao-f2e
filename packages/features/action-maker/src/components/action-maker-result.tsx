"use client";

import logoLargePng from "@daodao/assets/images/action-maker/logo-large.png";
import logoSmallPng from "@daodao/assets/images/action-maker/logo-small.png";
import { useAuth } from "@daodao/auth";
import { captureElementAsImage } from "@daodao/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActionMaker } from "../hooks/use-action-maker";
import { useCreatePracticeFromAction } from "../hooks/use-create-practice-from-action";
import { categoryMap } from "../utils/category-map";
import { StarryBackground } from "./starry-background";
import { amVarStyle } from "./styled";

const DEFAULT_BADGE = {
  bg: "bg-[var(--am-badge-beginner)] border border-[var(--am-badge-beginner-border)] text-[var(--am-badge-beginner-border)]",
  label: "初學",
} as const;
const CUSTOM_BADGE = { bg: "bg-[var(--am-gray-blue)]", label: "自訂" } as const;

const BADGE_STYLES: Record<string, { bg: string; label: string }> = {
  beginner: DEFAULT_BADGE,
  intermediate: {
    bg: "bg-[var(--am-badge-intermediate)] border border-[var(--am-badge-intermediate-border)] text-[var(--am-badge-intermediate-border)]",
    label: "中級",
  },
  advanced: {
    bg: "bg-[var(--am-badge-advanced)] border border-[var(--am-badge-advanced-border)] text-[var(--am-badge-advanced-border)]",
    label: "進階",
  },
  custom: CUSTOM_BADGE,
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.daodao.so";

const CARD_CLASS = "rounded-2xl border border-[var(--am-card-border)] bg-white/20 p-5";

export function ActionMakerResult() {
  const { state, result, isHydrated, reset, navigateTo } = useActionMaker();
  const { isAuthenticated, openLoginDialog } = useAuth();
  const { isCreating, createError, createPracticeFromResult } = useCreatePracticeFromAction();
  const cardRef = useRef<HTMLDivElement>(null);
  const pendingCreate = useRef(false);
  const hasHadResult = useRef(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadShareImage = useCallback(async () => {
    if (!result || !cardRef.current) return;
    setDownloading(true);

    try {
      const imageData = await captureElementAsImage(cardRef.current);
      if (!imageData) return;

      // Convert data URL to Blob without fetch() to avoid CSP connect-src blocking data: URIs
      const [header, base64] = imageData.src.split(",");
      const mime = header?.match(/:(.*?);/)?.[1] ?? "image/png";
      const binary = atob(base64 ?? "");
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      const imageFile = new File([blob], "action-maker-result.jpg", {
        type: "image/jpeg",
      });

      // Mobile: prefer native share with image
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      if (isMobile && navigator.share) {
        try {
          if (navigator.canShare?.({ files: [imageFile] })) {
            await navigator.share({
              title: `${result.nickname}的微習慣`,
              files: [imageFile],
            });
            return;
          }
        } catch {
          // User cancelled or not supported, fall through to download
        }
      }

      // Desktop / fallback: trigger download
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "action-maker-result.jpg";
      a.click();
      URL.revokeObjectURL(blobUrl);
    } finally {
      setDownloading(false);
    }
  }, [result]);

  const handleStartPractice = useCallback(async () => {
    if (!result) return;

    if (!isAuthenticated) {
      pendingCreate.current = true;
      const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || window.location.origin;
      openLoginDialog({
        redirectUrl: `${websiteUrl}/action-maker/result`,
        source: "website",
      });
      return;
    }

    const created = await createPracticeFromResult(result, state.sessionId, state.usedRefine);
    if (created?.practiceId) {
      window.location.href = `${APP_URL}/practices/${created.practiceId}`;
    }
  }, [
    result,
    isAuthenticated,
    openLoginDialog,
    createPracticeFromResult,
    state.sessionId,
    state.usedRefine,
  ]);

  // Auto-create after login
  useEffect(() => {
    if (isAuthenticated && pendingCreate.current && result) {
      pendingCreate.current = false;
      handleStartPractice();
    }
  }, [isAuthenticated, result, handleStartPractice]);

  if (result) {
    hasHadResult.current = true;
  }

  useEffect(() => {
    if (isHydrated && !result && !hasHadResult.current) {
      navigateTo("/action-maker", { replace: true });
    }
  }, [isHydrated, result, navigateTo]);

  if (!result) {
    return null;
  }

  const badge =
    BADGE_STYLES[result.action.level] ?? (result.isCustomAction ? CUSTOM_BADGE : DEFAULT_BADGE);

  const handlePlayAgain = () => {
    reset();
    navigateTo("/action-maker");
  };

  const CategoryIcon = categoryMap.get(result.category)?.icon;

  return (
    <StarryBackground>
      <div className="flex min-h-dvh flex-col pb-8 pt-16">
        <h1 className="px-6 text-center text-2xl font-bold text-white mb-6">
          恭喜！你建立了新的習慣
        </h1>
        {/* ===== Share card area (captured by cardRef) ===== */}
        <div ref={cardRef} className="mx-auto p-6">
          <div
            className="flex w-[350px] flex-col rounded-2xl px-5 pb-6 pt-12"
            style={{
              ...amVarStyle,
              background:
                "radial-gradient(ellipse 80% 50% at 110% 120%, rgba(120, 150, 210, 0.45) 0%, transparent 60%), linear-gradient(180deg, #0D1333 0%, #18215E 60%, #1A2468 100%)",
            }}
          >
            {/* Header — name left, category icon right */}
            <div className="relative mb-2">
              {CategoryIcon && (
                <div className="pointer-events-none absolute right-0 top-[-1rem]">
                  <CategoryIcon width={120} height={120} />
                </div>
              )}
              <h1 className="text-2xl font-bold text-white">{result.nickname}</h1>
              <p className="mt-1 text-lg text-white">你抓住了{result.categoryLabel}之星！</p>
            </div>

            {/* Subtitle */}
            <p className="mb-5 text-sm text-[var(--am-gray-blue)]">星星為你帶來的習慣是...</p>

            {/* Action card */}
            <div className={CARD_CLASS}>
              <div className="mb-3 flex items-center gap-3">
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${badge.bg}`}>
                  {badge.label}
                </span>
                <span className="font-bold text-white">{result.action.title}</span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--am-light-blue)]">
                {result.action.description}
              </p>
            </div>

            {/* Trigger timing + Duration — two columns */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className={CARD_CLASS}>
                <h3 className="mb-2 text-sm font-medium text-white">啟動時機</h3>
                <p className="text-sm leading-relaxed text-[var(--am-light-blue)]">
                  {result.triggerTiming || "隨時隨地"}
                </p>
              </div>
              <div className={CARD_CLASS}>
                <h3 className="mb-2 text-sm font-medium text-white">持續時間</h3>
                <p className="text-sm leading-relaxed text-[var(--am-light-blue)]">
                  {result.action.duration ?? "隨時隨地"}
                </p>
              </div>
            </div>

            {/* Starry tip card */}
            <div className={`mt-3 ${CARD_CLASS}`}>
              <h3 className="mb-2 text-sm font-medium text-white">星空小啟示</h3>
              <p className="text-sm leading-relaxed text-[var(--am-light-blue)]">
                {result.action.tip ?? "不需要完美，先開始就是好的開始。"}
              </p>
            </div>

            {/* DAO DAO Logo — bottom of share card (use <img> for html-to-image compatibility) */}
            <div className="mt-6 flex justify-center pb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSmallPng.src} alt="DAO DAO 島島阿學" width={146} height={32} />
            </div>
          </div>
        </div>
        {/* ===== End share card area ===== */}

        {/* CTA section */}
        <div className="mx-auto mt-10 w-[350px]">
          {/* Motivational copy — varies by auth state */}
          <p className="mt-6 text-center text-lg font-bold leading-relaxed text-white">
            {isAuthenticated ? (
              <>
                是否覺得躍躍欲試呢？
                <br />
                我們準備好了你的專屬空間
              </>
            ) : (
              <>
                加入島島阿學
                <br />
                探索更多美好生活提案
              </>
            )}
          </p>

          {/* Primary CTA */}
          <div className="relative mt-5">
            {!isCreating && (
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  boxShadow:
                    "6px -4px 24px -4px rgba(80, 120, 255, 0.5), -6px 6px 24px -4px rgba(211, 90, 255, 0.5)",
                }}
              />
            )}
            <button
              type="button"
              onClick={handleStartPractice}
              disabled={isCreating}
              className="relative w-full rounded-full py-4 text-lg font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background:
                  "radial-gradient(40% 80% at 95% 10%, rgba(107, 173, 224, 0.56) 0%, rgba(107, 173, 224, 0) 100%), radial-gradient(40% 80% at 5% 90%, rgba(211, 90, 255, 0.56) 0%, rgba(211, 90, 255, 0) 100%), #4285F4",
              }}
            >
              {isCreating ? "建立中..." : isAuthenticated ? "立刻開始實踐" : "註冊"}
            </button>
          </div>

          {createError && (
            <p className="mt-2 text-center text-sm text-red-400">{createError.message}</p>
          )}

          {/* Large DAO DAO logo (includes 島島阿學 text) */}
          <div className="my-10 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoLargePng.src} alt="DAO DAO 島島阿學" width={120} height={124} />
          </div>

          {/* 下載分享圖片 */}
          <button
            type="button"
            onClick={handleDownloadShareImage}
            disabled={downloading}
            className="mt-10 w-full rounded-full border border-[#7B8DB8] py-4 text-lg font-medium text-[#18215E] transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background:
                "radial-gradient(60% 100% at 90% 30%, rgba(107, 173, 224, 0.45) 0%, rgba(107, 173, 224, 0) 100%), radial-gradient(50% 100% at 10% 100%, rgba(211, 160, 255, 0.45) 0%, rgba(211, 160, 255, 0) 100%), white",
            }}
          >
            {downloading ? "產生中..." : "下載分享圖片"}
          </button>

          {/* 再玩一次 */}
          <button
            type="button"
            onClick={handlePlayAgain}
            className="mt-3 w-full rounded-full border border-white/30 py-4 text-lg text-white/80 transition-all duration-300 hover:border-white/50 hover:bg-white/10"
          >
            再玩一次
          </button>
        </div>
      </div>
    </StarryBackground>
  );
}
