"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@daodao/auth";
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

const TASK_LABELS: Record<OnboardingTaskKey, string> = {
  A: "完成學習風格測驗",
  B: "完善帳號設定",
  C: "建立第一個實踐",
  D: "完成第一次打卡",
  E: "在靈感頁留下留言",
};

const TASK_PATHS: Record<OnboardingTaskKey, string> = {
  A: "/quiz",
  B: "/settings/profile",
  C: "/practices/new",
  D: "/practices",
  E: "/inspirations",
};

// ── Widget Component ──────────────────────────────────────────────────────────

export function TaskGuideWidget() {
  const { isAuthenticated, isTemporary } = useAuth();
  const { taskList, completedTasks, badgeGranted, isLoading } = useOnboardingProgress();
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
      <div className="fixed bottom-20 right-4 z-40 w-72 rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
        <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3 text-white">
          <span className="text-sm font-semibold">恭喜完成！</span>
          <button onClick={handleCollapse} className="text-white/80 hover:text-white" aria-label="關閉">✕</button>
        </div>
        <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
          {/* Badge icon placeholder — 待設計師提供正式資產 */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-4xl">🏅</div>
          <p className="text-base font-semibold text-gray-800">恭喜獲得 Early User Badge！</p>
          <p className="text-xs text-gray-500">感謝你完成所有新手任務，你是島島阿學的早期用戶之一！</p>
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:scale-105"
        aria-label="展開 Onboarding 任務清單"
        title={`Onboarding 進度 ${completedTasks}/${total}`}
      >
        <span className="text-lg">🎯</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 w-72 rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3 text-white">
        <span className="text-sm font-semibold">新手入門任務</span>
        <button
          onClick={handleCollapse}
          className="text-white/80 hover:text-white"
          aria-label="收合"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>{completedTasks}/{total} 完成</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Task list */}
      <ul className="divide-y divide-gray-50 px-4 py-2">
        {taskList.map(({ taskKey, done }) => (
          <li key={taskKey} className="flex items-center gap-3 py-2">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                done
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {done ? "✓" : ""}
            </span>
            {done ? (
              <span className="text-sm text-gray-400 line-through">{TASK_LABELS[taskKey]}</span>
            ) : (
              <button
                onClick={() => {
                  router.push(TASK_PATHS[taskKey]);
                  handleCollapse();
                }}
                className="text-left text-sm text-gray-700 hover:text-primary hover:underline"
              >
                {TASK_LABELS[taskKey]}
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="rounded-b-2xl px-4 pb-3 text-center text-xs text-gray-400">
        完成所有任務即可獲得 Early User Badge 🏅
      </div>
    </div>
  );
}

// ── Optimistic update helper ──────────────────────────────────────────────────

/**
 * 從 API mutation 回應的 meta.onboardingUpdate 觸發樂觀更新。
 * 在各業務 mutation hook 的 onSuccess 中呼叫。
 */
export function applyOnboardingOptimisticUpdate(
  taskKey: OnboardingTaskKey,
  currentData?: { success: boolean; data: OnboardingStatusData }
) {
  if (!currentData?.data) return;

  const updatedTaskList = currentData.data.taskList.map((item) =>
    item.taskKey === taskKey ? { ...item, done: true } : item
  );
  const completedTasks = updatedTaskList.filter((t) => t.done).length;

  mutate(
    ONBOARDING_STATUS_KEY,
    {
      ...currentData,
      data: {
        ...currentData.data,
        taskList: updatedTaskList,
        completedTasks,
      },
    },
    { revalidate: false }
  );
}
