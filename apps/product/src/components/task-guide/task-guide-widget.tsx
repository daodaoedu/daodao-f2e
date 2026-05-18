"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@daodao/auth";
import { getRequiredEnv } from "@daodao/config";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Progress } from "@daodao/ui/components/progress";
import { cn } from "@daodao/ui/lib/utils";
import { BadgeCheck, Check, ListChecks, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import {
  ONBOARDING_STATUS_KEY,
  useOnboardingProgress,
  type OnboardingStatusData,
  type OnboardingTaskKey,
} from "./onboarding-progress-context";

// ── Constants ─────────────────────────────────────────────────────────────────

const SESSION_KEY = "task-guide-collapsed";
const PANEL_POSITION = "fixed bottom-39 right-5 md:bottom-34 md:right-15 z-40";
const TRIGGER_POSITION = "fixed bottom-[152px] right-[26px] md:bottom-[132px] md:right-[66px] z-40";

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
  B: "/settings/public-info",
  C: "/practices/create/manual",
  D: "/practices",
  E: "/",
};

// ── Widget Component ──────────────────────────────────────────────────────────

export function TaskGuideWidget() {
  const { isAuthenticated, isTemporary } = useAuth();
  const { taskList, completedTasks, badgeGranted, isLoading } = useOnboardingProgress();
  const t = useTranslations("onboarding.taskGuide");
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const autoExpandedRef = useRef(false);

  // 首次進入且 onboarding 未完成時自動展開
  useEffect(() => {
    if (isLoading || autoExpandedRef.current) return;
    if (taskList.length > 0 && completedTasks < taskList.length) {
      const collapsed = sessionStorage.getItem(SESSION_KEY);
      if (!collapsed) {
        setExpanded(true);
        autoExpandedRef.current = true;
      }
    }
  }, [isLoading, taskList.length, completedTasks]);

  const handleCollapse = useCallback(() => {
    setExpanded(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  // Gating：未登入 / isTemporary / badge 已取得 → 不顯示
  if (!isAuthenticated || isTemporary || badgeGranted) return null;
  if (isLoading || taskList.length === 0) return null;

  const total = taskList.length;
  const allCompleted = total > 0 && completedTasks >= total;
  const progressPct = total > 0 ? Math.round((completedTasks / total) * 100) : 0;

  // Badge 獲得狀態：allCompleted 但 badgeGranted 尚未從 server 確認時顯示慶祝畫面
  // （badgeGranted === true 時整個 widget 已被 gating 條件移除）
  if (allCompleted && expanded) {
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
            onClick={handleCollapse}
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
        {taskList.map(({ taskKey, done, ctaHref }) => (
          <li key={taskKey} className="flex items-center gap-3 py-2.5">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                done
                  ? "border-logo-cyan bg-logo-cyan text-white"
                  : "border-light-gray bg-white text-transparent"
              )}
            >
              <Check className="size-3.5" />
            </span>
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
                className="min-w-0 text-left text-sm leading-5 text-text-dark transition-colors hover:text-logo-cyan"
              >
                {t(`tasks.${taskKey}`)}
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="border-t border-very-light-gray bg-very-light-blue px-4 py-3 text-center text-xs leading-5 text-text-dark/60">
        {t("footer")}
      </div>
    </div>
  );
}

// ── Optimistic update helper ──────────────────────────────────────────────────

/**
 * 從 API mutation 回應的 meta.onboardingUpdate 觸發樂觀更新。
 * 在各業務 mutation hook 的 onSuccess 中呼叫。
 */
export function applyOnboardingOptimisticUpdate(taskKey: OnboardingTaskKey) {
  mutate(
    ONBOARDING_STATUS_KEY,
    (prev?: { success: boolean; data: OnboardingStatusData }) => {
      if (!prev?.data) return prev;
      const updatedTaskList = prev.data.taskList.map((item) =>
        item.taskKey === taskKey ? { ...item, done: true } : item
      );
      return {
        ...prev,
        data: {
          ...prev.data,
          taskList: updatedTaskList,
          completedTasks: updatedTaskList.filter((t) => t.done).length,
        },
      };
    },
    { revalidate: false }
  );
}
