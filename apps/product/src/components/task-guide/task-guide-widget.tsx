"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@daodao/auth";
import { getRequiredEnv } from "@daodao/config";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Progress } from "@daodao/ui/components/progress";
import { cn } from "@daodao/ui/lib/utils";
import { BadgeCheck, Check, ListChecks, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useOnboardingProgress,
  type OnboardingTaskKey,
} from "./onboarding-progress-context";

// ── Constants ─────────────────────────────────────────────────────────────────

const SESSION_KEY = "task-guide-collapsed";
const CELEBRATION_DISMISSED_KEY = "task-guide-celebration-dismissed";
const PANEL_POSITION = "fixed bottom-39 right-5 md:bottom-34 md:right-15 z-40";
const TRIGGER_POSITION = "fixed bottom-[152px] right-[26px] md:bottom-[132px] md:right-[66px] z-40";
const PROFILE_TASK_DESCRIPTION_FALLBACK = {
  en: "Complete all three sections: public info, account settings, and preferences",
  "zh-TW": "需完成公開資訊、帳號設定與領域偏好三個區塊",
};

function getQuizUrl() {
  const websiteUrl = getRequiredEnv("NEXT_PUBLIC_WEBSITE_URL").replace(/\/$/, "");

  if (typeof window === "undefined") {
    return `${websiteUrl}/quiz`;
  }

  const isLocalProduct =
    window.location.hostname === "localhost" &&
    (window.location.port === "3001" || window.location.port === "3002");

  if (isLocalProduct && websiteUrl === window.location.origin) {
    return "http://localhost:3000/quiz";
  }

  return `${websiteUrl}/quiz`;
}

const TASK_PATHS: Record<OnboardingTaskKey, string> = {
  A: "quiz",
  B: "/settings",
  C: "/practices/create/manual",
  D: "/practices",
  E: "/",
};

// ── Widget Component ──────────────────────────────────────────────────────────

export function TaskGuideWidget() {
  const { isAuthenticated, isTemporary } = useAuth();
  const { taskList, completedTasks, badgeGranted, isLoading } = useOnboardingProgress();
  const t = useTranslations("onboarding.taskGuide");
  const locale = useLocale();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const autoExpandedRef = useRef(false);

  useEffect(() => {
    setCelebrationDismissed(sessionStorage.getItem(CELEBRATION_DISMISSED_KEY) === "1");
  }, []);

  // 首次進入且 onboarding 未完成時自動展開；完成後則展示一次慶祝畫面。
  useEffect(() => {
    if (isLoading || autoExpandedRef.current) return;
    const total = taskList.length;
    const allCompleted = total > 0 && completedTasks >= total;

    if (allCompleted && !celebrationDismissed) {
      setExpanded(true);
      autoExpandedRef.current = true;
      return;
    }

    if (total > 0 && completedTasks < total) {
      const collapsed = sessionStorage.getItem(SESSION_KEY);
      if (!collapsed) {
        setExpanded(true);
        autoExpandedRef.current = true;
      }
    }
  }, [isLoading, taskList.length, completedTasks, celebrationDismissed]);

  const handleCollapse = useCallback(() => {
    setExpanded(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  const handleDismissCelebration = useCallback(() => {
    setCelebrationDismissed(true);
    setExpanded(false);
    sessionStorage.setItem(CELEBRATION_DISMISSED_KEY, "1");
    sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  // Gating：未登入 / isTemporary → 不顯示
  if (!isAuthenticated || isTemporary) return null;
  if (isLoading || taskList.length === 0) return null;

  const total = taskList.length;
  const allCompleted = total > 0 && completedTasks >= total;
  const progressPct = total > 0 ? Math.round((completedTasks / total) * 100) : 0;

  if (badgeGranted && (!allCompleted || celebrationDismissed)) return null;

  // Badge 獲得狀態：allCompleted 時顯示一次慶祝畫面，使用者關閉後才隱藏。
  if (allCompleted && expanded && !celebrationDismissed) {
    return (
      <div
        className={cn(
          PANEL_POSITION,
          "w-[min(calc(100vw-40px),320px)] overflow-hidden rounded-[20px] border border-light-cyan bg-white shadow-[0_16px_40px_rgba(41,94,92,0.14)]"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-very-light-gray px-4 py-3">
          <span className="text-base font-semibold text-text-dark">{t("celebration.title")}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismissCelebration}
            className="size-8 text-light-gray hover:text-text-dark"
            aria-label={t("ariaClose")}
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-logo-orange/20 text-logo-orange">
            <BadgeCheck className="size-8" />
          </div>
          <p className="text-base font-semibold text-text-dark">{t("celebration.badgeTitle")}</p>
          <p className="text-xs leading-5 text-text-dark/60">{t("celebration.badgeDescription")}</p>
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <Button
        variant="default"
        size="icon"
        onClick={() => setExpanded(true)}
        className={cn(TRIGGER_POSITION, "size-12 shadow-[0_10px_24px_rgba(22,185,179,0.22)]")}
        aria-label={t("ariaOpen")}
        title={t("progress", { completed: completedTasks, total })}
      >
        <ListChecks className="size-5" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        PANEL_POSITION,
        "w-[min(calc(100vw-40px),320px)] overflow-hidden rounded-[20px] border border-light-cyan bg-white shadow-[0_16px_40px_rgba(41,94,92,0.14)]"
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-very-light-gray px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-light-blue text-logo-cyan">
            <ListChecks className="size-4.5" />
          </div>
          <span className="truncate text-base font-semibold text-text-dark">{t("title")}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCollapse}
          className="size-8 shrink-0 text-light-gray hover:text-text-dark"
          aria-label={t("ariaCollapse")}
        >
          <X className="size-5" />
        </Button>
      </div>

      <div className="px-4 pt-3">
        <div className="mb-2 flex justify-between text-xs font-medium text-text-dark/60">
          <span>{t("progress", { completed: completedTasks, total })}</span>
          <span>{progressPct}%</span>
        </div>
        <Progress value={progressPct} className="h-2 bg-very-light-gray [--active-color:var(--logo-cyan)]" />
      </div>

      <ul className="divide-y divide-very-light-gray px-4 py-2">
        {taskList.map(({ taskKey, done, ctaHref }) => {
          const hasDescription =
            typeof (t as { has?: (key: string) => boolean }).has === "function" &&
            (t as { has: (key: string) => boolean }).has("taskDescriptions.B");
          const taskDescription =
            taskKey === "B" && !done
              ? hasDescription
                ? t("taskDescriptions.B")
                : PROFILE_TASK_DESCRIPTION_FALLBACK[
                    locale as keyof typeof PROFILE_TASK_DESCRIPTION_FALLBACK
                  ] ?? PROFILE_TASK_DESCRIPTION_FALLBACK.en
              : null;

          return (
            <li key={taskKey} className="flex items-start gap-3 py-2.5">
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                done
                  ? "border-logo-cyan bg-logo-cyan text-white"
                  : "border-light-gray bg-white text-transparent"
              )}
            >
              <Check className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              {done ? (
                <span className="text-sm leading-5 text-light-gray line-through">
                  {t(`tasks.${taskKey}`)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const path = ctaHref ?? (taskKey === "A" ? getQuizUrl() : TASK_PATHS[taskKey]);
                    if (path.startsWith("http")) {
                      window.location.href = path;
                    } else {
                      router.push(path);
                    }
                    handleCollapse();
                  }}
                  className="text-left text-sm leading-5 text-text-dark transition-colors hover:text-logo-cyan"
                >
                  {t(`tasks.${taskKey}`)}
                </button>
              )}
              {taskDescription ? (
                <p className="mt-1 text-xs leading-4 text-text-dark/55">{taskDescription}</p>
              ) : null}
            </div>
          </li>
          );
        })}
      </ul>

      <div className="border-t border-very-light-gray bg-very-light-blue px-4 py-3 text-center text-xs leading-5 text-text-dark/60">
        {t("footer")}
      </div>
    </div>
  );
}
