"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useActionMaker } from "../hooks/use-action-maker";
import type { PracticeTimePeriod } from "../types";
import { limits } from "../utils/validation";
import { NavigationButtons } from "./navigation-buttons";
import { ProgressBar } from "./progress-bar";
import { StarryBackground } from "./starry-background";

const DEFAULT_BADGE = {
  bg: "bg-[var(--am-badge-beginner)] border border-[var(--am-badge-beginner-border)] text-[var(--am-badge-beginner-border)]",
  label: "初學",
} as const;

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
};

const TIMING_OPTIONS: { label: string; period: PracticeTimePeriod }[] = [
  { label: "早餐前", period: "morning" },
  { label: "通勤時", period: "commute" },
  { label: "午休時", period: "afternoon" },
  { label: "晚餐後", period: "evening" },
  { label: "睡前", period: "night" },
];

export function ActionMakerDetail() {
  const { state, dispatch, isHydrated, navigateTo } = useActionMaker();
  const { userSelection } = state;
  const action = userSelection.action;

  // Parse existing state back into selected periods + custom text
  const [selectedPeriods, setSelectedPeriods] = useState<PracticeTimePeriod[]>(
    () => userSelection.triggerTimingPeriods ?? []
  );
  const [customTiming, setCustomTiming] = useState(() => {
    if (!userSelection.triggerTiming) return "";
    const knownLabels = new Set(TIMING_OPTIONS.map((o) => o.label));
    const parts = userSelection.triggerTiming.split("、");
    return parts.filter((p) => !knownLabels.has(p)).join("、");
  });

  // Navigate to result only after triggerTiming is committed to state
  const [pendingComplete, setPendingComplete] = useState(false);

  useEffect(() => {
    if (isHydrated && !action) {
      navigateTo("/action-maker/actions", { replace: true });
    }
  }, [isHydrated, action, navigateTo]);

  useEffect(() => {
    if (pendingComplete && userSelection.triggerTiming) {
      navigateTo("/action-maker/result");
    }
  }, [pendingComplete, userSelection.triggerTiming, navigateTo]);

  const combinedTiming = useMemo(() => {
    const labels = selectedPeriods.map(
      (p) => TIMING_OPTIONS.find((o) => o.period === p)?.label ?? p
    );
    const trimmed = customTiming.trim();
    if (trimmed) labels.push(trimmed);
    return labels.join("、");
  }, [selectedPeriods, customTiming]);

  const isValid =
    combinedTiming.length > 0 && combinedTiming.length <= limits.TRIGGER_TIMING_MAX_LENGTH;

  const togglePeriod = useCallback((period: PracticeTimePeriod) => {
    setSelectedPeriods((prev) =>
      prev.includes(period) ? prev.filter((p) => p !== period) : [...prev, period]
    );
  }, []);

  if (!action) {
    return null;
  }

  const badge = BADGE_STYLES[action.level] ?? DEFAULT_BADGE;

  const handleComplete = () => {
    if (!isValid) return;
    dispatch({
      type: "SET_TRIGGER_TIMING",
      payload: { timing: combinedTiming, periods: selectedPeriods },
    });
    setPendingComplete(true);
  };

  const handleReselect = () => {
    navigateTo("/action-maker/actions", { replace: true });
  };

  return (
    <StarryBackground fullWidthDesktop>
      <div className="flex min-h-dvh flex-col">
        <ProgressBar current={3} />

        <div className="w-full md:max-w-[85%] md:mx-auto flex flex-1 flex-col gap-6 px-6 pt-8">
          {/* Badge + Title */}
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs ${badge.bg}`}>{badge.label}</span>
            <h2 className="text-xl font-bold text-white">{action.title}</h2>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-[#7B9FC4]">具體行動內容</h3>
            {action.duration && <p className="mb-2 text-xs text-[#7B9FC4]">{action.duration}</p>}
            <p className="leading-relaxed text-[#BCD5EE]">{action.description}</p>
          </div>

          {/* Trigger timing - multi-select */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-[#7B9FC4]">啟動時機（多選）</h3>
            <div className="flex flex-wrap gap-3">
              {TIMING_OPTIONS.map(({ label, period }) => {
                const selected = selectedPeriods.includes(period);
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => togglePeriod(period)}
                    className={`rounded-lg border px-5 py-2.5 text-sm transition-all duration-200 ${
                      selected
                        ? "border-white/50 bg-white/20 text-white"
                        : "border-white/20 bg-white/5 text-[#BCD5EE] hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom timing input */}
          <input
            type="text"
            value={customTiming}
            onChange={(e) => setCustomTiming(e.target.value)}
            placeholder="填寫其他時段"
            maxLength={limits.TRIGGER_TIMING_MAX_LENGTH}
            className="w-full rounded-xl border border-[#BCD5EE]/20 bg-white/5 px-5 py-4 text-white placeholder:text-[#7B9FC4] focus:border-[#BCD5EE]/40 focus:outline-none"
          />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <NavigationButtons
            primaryLabel="完成"
            secondaryLabel="重新選擇"
            onPrimary={handleComplete}
            onSecondary={handleReselect}
            primaryDisabled={!isValid}
            showRefreshIcon
          />
        </div>
      </div>
    </StarryBackground>
  );
}
