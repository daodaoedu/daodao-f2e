"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import {
  BookOpen,
  Check,
  ChevronRight,
  Flame,
  Gamepad2,
  Hammer,
  Heart,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ComponentType } from "react";
import { useCallback, useState } from "react";
import { LEARNING_TOOL_OPTIONS, type LearningTool } from "@/constants/learning-tool";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Video,
  BookOpen,
  Hammer,
  Users,
  MessageCircle,
  Gamepad2,
};

const TOOL_COLOR: Record<LearningTool, string> = {
  video: "bg-blue-100 text-blue-600 border-blue-200",
  reading: "bg-amber-100 text-amber-600 border-amber-200",
  project: "bg-green-100 text-green-600 border-green-200",
  community: "bg-purple-100 text-purple-600 border-purple-200",
  oneOnOne: "bg-pink-100 text-pink-600 border-pink-200",
  gamification: "bg-orange-100 text-orange-600 border-orange-200",
};

const TOTAL_STEPS = 6;

interface LoopState {
  step: number;
  selectedTools: LearningTool[];
  weeklyCount: number;
  isMethodChanged: boolean;
}

function StepIndicator({
  current,
  total,
  t,
}: {
  current: number;
  total: number;
  t: (key: string, values?: Record<string, string>) => string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={`step-${i + 1}`}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i + 1 === current
              ? "w-8 bg-logo-cyan"
              : i + 1 < current
                ? "w-4 bg-logo-cyan/40"
                : "w-4 bg-gray-200"
          )}
        />
      ))}
      <span className="text-xs text-light-gray ml-2">
        {t("step_current", { current: String(current), total: String(total) })}
      </span>
    </div>
  );
}

function StepSelectTool({
  state,
  onSelect,
  t,
}: {
  state: LoopState;
  onSelect: (tools: LearningTool[]) => void;
  t: (key: string, values?: Record<string, string>) => string;
}) {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-text-dark">{t("step_select_tool")}</h2>
        <p className="text-sm text-light-gray mt-1">{t("step_select_tool_desc")}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {LEARNING_TOOL_OPTIONS.map((option) => {
          const isSelected = state.selectedTools.includes(option.value);
          const Icon = ICON_MAP[option.icon];
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                const next = isSelected
                  ? state.selectedTools.filter((v) => v !== option.value)
                  : [...state.selectedTools, option.value];
                onSelect(next);
              }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                isSelected
                  ? TOOL_COLOR[option.value]
                  : "bg-white border-gray-100 text-text-dark hover:border-gray-200"
              )}
            >
              {Icon && <Icon className="size-7" />}
              <span className="text-sm font-medium">{t(option.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepCheckIn({
  state,
  t,
}: {
  state: LoopState;
  t: (key: string, values?: Record<string, string>) => string;
}) {
  const primaryTool = state.selectedTools[0];
  const toolOption = LEARNING_TOOL_OPTIONS.find((o) => o.value === primaryTool);
  const Icon = toolOption ? ICON_MAP[toolOption.icon] : null;

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-text-dark">{t("step_checkin")}</h2>
        <p className="text-sm text-light-gray mt-1">{t("step_checkin_desc")}</p>
      </div>

      {/* Practice card */}
      <div className="bg-white rounded-2xl p-5 border border-[#C1ECFF] mb-4">
        <h3 className="font-medium text-text-dark mb-1">{t("demo_practice_name")}</h3>
        <p className="text-sm text-light-gray">{t("demo_practice_action")}</p>
      </div>

      {/* Auto-filled method */}
      {primaryTool && toolOption && (
        <div className="bg-[#E6FBF8] rounded-xl p-4 mb-4">
          <p className="text-sm text-text-dark mb-2">{t("step_checkin_continue_method")}</p>
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg border",
              TOOL_COLOR[primaryTool]
            )}
          >
            {Icon && <Icon className="size-5" />}
            <span className="font-medium">{t(toolOption.labelKey)}</span>
            <Check className="size-4" />
          </div>
          <button type="button" className="block text-xs text-logo-cyan mt-2 hover:underline">
            {t("step_checkin_change_method")}
          </button>
        </div>
      )}

      {/* Mood placeholder */}
      <div className="flex justify-center gap-4 py-4">
        {["😫", "😐", "🙂", "😊", "🤩"].map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="text-2xl hover:scale-125 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepFeedback({
  state,
  t,
}: {
  state: LoopState;
  t: (key: string, values?: Record<string, string>) => string;
}) {
  const days = String(state.weeklyCount);
  const isMilestone = state.weeklyCount >= 5;

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-text-dark">{t("step_feedback")}</h2>
      </div>

      {/* Encouragement */}
      <motion.div
        className="bg-gradient-to-br from-[#E6FBF8] to-white rounded-2xl p-5 border border-[#C1ECFF] mb-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-logo-cyan shrink-0 mt-0.5" />
          <p className="text-sm text-text-dark leading-relaxed">
            {t("step_feedback_encouragement", { days })}
          </p>
        </div>
      </motion.div>

      {/* Ember */}
      <motion.div
        className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-orange-200 mb-4"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <Flame className="size-10 text-orange-500" />
        </motion.div>
        <div>
          <p className="font-medium text-text-dark">{t("step_feedback_ember_title")}</p>
          <p className="text-sm text-orange-500">{t("step_feedback_ember_growing")}</p>
        </div>
      </motion.div>

      {/* Streak */}
      <motion.div
        className="flex items-center justify-between bg-white rounded-2xl p-5 border border-[#C1ECFF] mb-4"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <Trophy className="size-6 text-logo-cyan" />
          <span className="text-lg font-bold text-text-dark">
            {t("step_feedback_streak_update", { days })}
          </span>
        </div>
        <span className="text-2xl">🔥</span>
      </motion.div>

      {/* Milestone */}
      {isMilestone && (
        <motion.div
          className="bg-gradient-to-r from-logo-cyan to-[#7DD3FC] rounded-2xl p-5 text-white text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="font-bold text-lg">🎉 {t("step_feedback_milestone")}</p>
          <p className="text-sm opacity-90 mt-1">{t("step_feedback_milestone_desc", { days })}</p>
        </motion.div>
      )}
    </div>
  );
}

function StepObserve({
  state,
  t,
}: {
  state: LoopState;
  t: (key: string, values?: Record<string, string>) => string;
}) {
  // Based on real practice #40: 商務日語口說計畫
  const weeks = [
    { week: 1, tools: ["video" as LearningTool, "reading" as LearningTool], rate: 6 },
    { week: 2, tools: ["video" as LearningTool, "reading" as LearningTool], rate: 5 },
    { week: 3, tools: ["video" as LearningTool], rate: 3 },
    {
      week: 4,
      tools: state.selectedTools.length > 0 ? state.selectedTools : ["reading" as LearningTool],
      rate: 2,
    },
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-text-dark">{t("step_observe")}</h2>
        <p className="text-sm text-light-gray mt-1">{t("step_observe_desc")}</p>
      </div>

      {/* Mini growth map */}
      <div className="bg-white rounded-2xl p-5 border border-[#C1ECFF] mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-text-dark">{t("growth_map_weekly_timeline")}</h3>
          <span className="text-sm text-logo-cyan font-medium">
            {t("growth_map_level", { level: "3" })}
          </span>
        </div>
        <div className="space-y-3">
          {weeks.map((w) => (
            <motion.div
              key={w.week}
              className="flex items-center gap-3"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: w.week * 0.1 }}
            >
              <span className="text-xs text-light-gray w-6">W{w.week}</span>
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#C1ECFF] to-logo-cyan rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(w.rate / 7) * 100}%` }}
                  transition={{ duration: 0.5, delay: w.week * 0.1 }}
                />
              </div>
              <span className="text-xs text-light-gray w-6">{w.rate}/7</span>
              <div className="flex gap-0.5">
                {w.tools.map((tool) => {
                  const opt = LEARNING_TOOL_OPTIONS.find((o) => o.value === tool);
                  const TIcon = opt ? ICON_MAP[opt.icon] : null;
                  return TIcon ? (
                    <span
                      key={tool}
                      className={cn(
                        "inline-flex items-center justify-center size-5 rounded-full",
                        TOOL_COLOR[tool]
                      )}
                    >
                      <TIcon className="size-3" />
                    </span>
                  ) : null;
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Most effective */}
      <motion.div
        className="bg-purple-50 rounded-2xl p-4 border border-purple-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-700">
            {t("growth_map_most_effective")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              TOOL_COLOR.community
            )}
          >
            <Users className="size-3" />
            {t("learning_tool_community")}
          </span>
          <span className="text-xs text-light-gray">— W3 後連續性明顯提升</span>
        </div>
      </motion.div>
    </div>
  );
}

function StepDrift({ t }: { t: (key: string, values?: Record<string, string>) => string }) {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-text-dark">{t("step_drift")}</h2>
      </div>

      {/* Buddy notification */}
      <motion.div
        className="bg-white rounded-2xl p-5 border border-pink-200 mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-full bg-pink-100 flex items-center justify-center">
            <Heart className="size-5 text-pink-500" />
          </div>
          <div>
            <p className="font-medium text-text-dark">{t("step_drift_title")}</p>
            <p className="text-xs text-light-gray">Buddy · 小明</p>
          </div>
        </div>
        <p className="text-sm text-text-dark/80 leading-relaxed">{t("step_drift_buddy_msg")}</p>
      </motion.div>

      {/* Method suggestion */}
      <motion.div
        className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-5 border border-amber-200 mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-text-dark/80 leading-relaxed">{t("step_drift_suggestion")}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 px-3 py-2 rounded-lg bg-logo-cyan text-white text-sm font-medium"
          >
            {t("step_drift_switch")}
          </button>
          <button
            type="button"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-text-dark text-sm"
          >
            {t("step_drift_keep")}
          </button>
        </div>
      </motion.div>

      {/* Philosophy note */}
      <div className="text-center px-4">
        <p className="text-xs text-light-gray leading-relaxed">
          ❌ "你今天還沒打卡"（罪惡感驅動）
          <br />✅ "你的 Buddy 今天打卡了"（連結感驅動）
        </p>
      </div>
    </div>
  );
}

function StepContext({ t }: { t: (key: string, values?: Record<string, string>) => string }) {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-text-dark">{t("step_context")}</h2>
        <p className="text-sm text-light-gray mt-1">{t("step_context_desc")}</p>
      </div>

      {/* Day 1 message */}
      <motion.div
        className="bg-gradient-to-br from-white to-[#E6FBF8] rounded-2xl p-6 border border-[#C1ECFF] mb-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs text-light-gray mb-3">📝 {t("growth_map_day1_message_title")}</p>
        <blockquote className="text-base text-text-dark leading-relaxed italic border-l-3 border-logo-cyan pl-4">
          「希望三個月後能跟外國人聊天不卡」
        </blockquote>
        <p className="text-xs text-light-gray mt-3">— 35 天前的你</p>
      </motion.div>

      {/* Loop complete */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-logo-cyan to-[#7DD3FC] text-white font-medium mb-4">
          <Sparkles className="size-4" />
          {t("step_loop_complete")}
        </div>
        <p className="text-sm text-text-dark/70 leading-relaxed max-w-[300px] mx-auto">
          {t("step_loop_complete_desc")}
        </p>

        {/* Motivation diagram */}
        <div className="flex justify-center gap-4 mt-6">
          <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs font-medium text-blue-600">{t("loop_intrinsic")}</p>
            <p className="text-[10px] text-blue-400 mt-0.5">{t("loop_intrinsic_desc")}</p>
          </div>
          <div className="flex items-center">
            <span className="text-lg">⇄</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-xs font-medium text-orange-600">{t("loop_extrinsic")}</p>
            <p className="text-[10px] text-orange-400 mt-0.5">{t("loop_extrinsic_desc")}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const STEP_LABELS = [
  "step_select_tool",
  "step_checkin",
  "step_feedback",
  "step_observe",
  "step_drift",
  "step_context",
] as const;

export function LearningLoopDemo() {
  const t = useTranslations("learning_harness");
  const [state, setState] = useState<LoopState>({
    step: 1,
    selectedTools: ["video", "reading"],
    weeklyCount: 4,
    isMethodChanged: false,
  });

  const goNext = useCallback(() => {
    setState((prev) => {
      if (prev.step >= TOTAL_STEPS) {
        return { ...prev, step: 1, weeklyCount: Math.min(prev.weeklyCount + 1, 7) };
      }
      const next = { ...prev, step: prev.step + 1 };
      if (prev.step === 2) {
        next.weeklyCount = Math.min(prev.weeklyCount + 1, 7);
      }
      return next;
    });
  }, []);

  const handleToolSelect = useCallback((tools: LearningTool[]) => {
    setState((prev) => ({ ...prev, selectedTools: tools }));
  }, []);

  const currentLabel = t(STEP_LABELS[state.step - 1] ?? "step_select_tool");
  const isLast = state.step === TOTAL_STEPS;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <StepIndicator current={state.step} total={TOTAL_STEPS} t={t} />

      {/* Step label */}
      <div className="flex items-center justify-center gap-2">
        <div className="size-8 rounded-full bg-logo-cyan text-white flex items-center justify-center text-sm font-bold">
          {state.step}
        </div>
        <span className="text-sm font-medium text-text-dark">{currentLabel}</span>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {state.step === 1 && <StepSelectTool state={state} onSelect={handleToolSelect} t={t} />}
          {state.step === 2 && <StepCheckIn state={state} t={t} />}
          {state.step === 3 && <StepFeedback state={state} t={t} />}
          {state.step === 4 && <StepObserve state={state} t={t} />}
          {state.step === 5 && <StepDrift t={t} />}
          {state.step === 6 && <StepContext t={t} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="pt-4">
        <Button
          type="button"
          variant="orange"
          className="w-full"
          onClick={goNext}
          disabled={state.step === 1 && state.selectedTools.length === 0}
        >
          {isLast ? (
            <>
              <RotateCcw className="size-4.5" />
              {t("step_loop_restart")}
            </>
          ) : (
            <>
              {state.step === 2 ? t("step_checkin_confirm") : t("step_next")}
              <ChevronRight className="size-4.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
