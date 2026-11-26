"use client";

import { useTranslations } from "@daodao/i18n";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@daodao/ui/components/animate-ui/components/base/tooltip";
import { useDialogManager } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { cn } from "@daodao/ui/lib/utils";
import { RadioGroup, RadioGroupItem } from "@daodao/ui/components/radio-group";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { CHECK_IN_MOOD_OPTIONS, type MoodType as MoodTypeValue } from "@/constants/mood";
import { getProgressAnimationAction } from "./check-in-progress-animation";

interface UseCheckInSuccessDialogOptions {
  from?: number;
  to?: number;
}

/**
 * 煙火效果組件 - 在指定位置綻放小球
 */
function Fireworks() {
  const fireworksId = useId();
  const particles = useMemo(() => {
    const count = 7;
    return Array.from({ length: count }, (_, i) => {
      const angle = (360 / count) * i + (Math.random() - 0.5) * 30;
      const distance = 30 + Math.random() * 20;
      const delay = Math.random() * 0.2 * (i % 2);
      const duration = 0.6 + Math.random() * 0.2;
      const scale = 1 - Math.random() * 0.5;
      const colors = [
        "bg-blue",
        "bg-logo-cyan",
        "bg-logo-cyan",
        "bg-logo-cyan",
        "bg-logo-orange",
        "bg-logo-orange",
        "bg-logo-yellow",
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        id: i,
        angle,
        distance,
        delay,
        duration,
        scale,
        color,
      };
    });
  }, []);

  useEffect(() => {
    // 動態注入 keyframes
    const styleId = `fireworks-keyframes-${fireworksId}`;
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = particles
      .map(
        (particle) => `
      @keyframes fireworks-particle-${particle.id} {
        0% {
          opacity: 1;
          transform: rotate(${particle.angle}deg) translateX(0px) scale(${particle.scale});
        }
        100% {
          opacity: 0;
          transform: rotate(${particle.angle}deg) translateX(${particle.distance}px) scale(0);
        }
      }
    `
      )
      .join("\n");

    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [particles, fireworksId]);

  return particles.map((particle) => (
    <div
      key={particle.id}
      className={cn("absolute w-3 h-3 rounded-full", particle.color)}
      style={{
        animation: `fireworks-particle-${particle.id} ${particle.duration}s ease-out ${particle.delay}s forwards`,
      }}
    />
  ));
}

interface AlwaysOpenTooltipProps {
  from: number;
  to: number;
  shouldStartAnimation?: boolean;
}

/**
 * 始終保持開啟的 Tooltip 組件
 */
function AlwaysOpenTooltip({ from, to, shouldStartAnimation = true }: AlwaysOpenTooltipProps) {
  const [percentage, setPercentage] = useState(from);
  const [isAnimated, setIsAnimated] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    const action = getProgressAnimationAction({
      percentage,
      from,
      to,
      started: shouldStartAnimation,
      finished: isAnimated,
    });
    if (action === "idle") return;

    // 當動畫完成時觸發煙火效果
    if (action === "finish") {
      setPercentage(to);
      setIsAnimated(true);
      setShowFireworks(true);
      return;
    }

    // 執行進度動畫
    const interval = setInterval(
      () => {
        requestAnimationFrame(() => {
          setPercentage((prev) => {
            const next = prev + 1;
            if (next >= to) {
              return to;
            }
            return next;
          });
        });
      },
      600 / Math.abs(to - from)
    );

    return () => clearInterval(interval);
  }, [from, to, percentage, isAnimated, shouldStartAnimation]);

  return (
    <Tooltip alwaysOpen open>
      <div className="absolute inset-x-10 bottom-5 h-[12px] rounded-full bg-very-light-gray">
        <div
          className="w-full h-full bg-linear-90 from-blue to-logo-cyan rounded-full origin-left"
          style={{ transform: `scaleX(${Math.min(percentage, 100)}%)` }}
        />
        <TooltipTrigger
          render={
            <div
              className="absolute top-0 h-full aspect-square -translate-x-1/2"
              style={{ left: `${Math.min(percentage, 100)}%` }}
            >
              {showFireworks && <Fireworks />}
            </div>
          }
        />
      </div>
      <TooltipPanel
        sideOffset={16}
        side="top"
        className="rounded-full bg-logo-cyan px-3 py-1 text-2xl font-bold text-white [--arrow-size:12px]"
      >
        {percentage}%
      </TooltipPanel>
    </Tooltip>
  );
}

interface Step1AnimationProps {
  from: number;
  to: number;
}

function Step1Animation({ from, to }: Step1AnimationProps) {
  const [shouldStartAnimation, setShouldStartAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldStartAnimation(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative mb-3 h-24 rounded-2xl bg-very-light-gray/60 px-4 pt-2">
      <AlwaysOpenTooltip from={from} to={to} shouldStartAnimation={shouldStartAnimation} />
    </div>
  );
}

interface Step2AnimationProps {
  encouragement?: string;
}

function Step2Animation({ encouragement }: Step2AnimationProps) {
  const t = useTranslations("check_in");

  return (
    <div className="space-y-1">
      <p>{encouragement || t("success_default_encouragement")}</p>
    </div>
  );
}

function MoodFollowUp({
  initialMood,
  onMoodChange,
}: {
  initialMood: MoodTypeValue | null;
  onMoodChange?: (mood: MoodTypeValue) => void;
}) {
  const t = useTranslations("check_in");
  const [mood, setMood] = useState<MoodTypeValue | null>(initialMood);

  return (
    <section className="mt-3 rounded-2xl border border-logo-cyan/25 bg-logo-cyan/5 px-3 py-3 shadow-sm">
      <p className="mb-2 text-base font-semibold text-text-dark">{t("mood_follow_up_title")}</p>
      <RadioGroup
        value={mood ?? ""}
        onValueChange={(value) => {
          const nextMood = value as MoodTypeValue;
          setMood(nextMood);
          onMoodChange?.(nextMood);
        }}
        className="grid grid-cols-5 gap-1.5"
      >
        {CHECK_IN_MOOD_OPTIONS.map(({ id, label, emoji: Emoji }) => {
          const translatedLabel = t(`moods.${id}`);
          const inputId = `post-checkin-mood-${id}`;
          return (
            <label
              key={id}
              htmlFor={inputId}
              className={cn(
                "flex min-w-0 cursor-pointer flex-col items-center gap-1 rounded-xl border border-transparent px-1 py-2 text-center transition-colors hover:bg-white focus-within:ring-2 focus-within:ring-logo-cyan/50",
                mood === id ? "border-logo-cyan/40 bg-white shadow-sm" : "bg-white/55"
              )}
            >
              <RadioGroupItem
                value={id}
                id={inputId}
                className="sr-only"
                aria-label={translatedLabel}
              />
              <Emoji className="size-8" aria-hidden="true" />
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  mood === id ? "font-semibold text-text-dark" : "text-gray-600"
                )}
              >
                {translatedLabel || label}
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </section>
  );
}

interface CheckInSuccessContentProps {
  from: number;
  to: number;
  encouragement?: string;
  initialMood: MoodTypeValue | null;
  onMoodChange?: (mood: MoodTypeValue) => void;
}

function CheckInSuccessContent({
  from,
  to,
  encouragement,
  initialMood,
  onMoodChange,
}: CheckInSuccessContentProps) {
  return (
    <>
      <Step1Animation from={from} to={to} />
      <Step2Animation encouragement={encouragement} />
      <MoodFollowUp initialMood={initialMood} onMoodChange={onMoodChange} />
    </>
  );
}

/**
 * 使用全局 DialogManager 來顯示打卡成功對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openSuccessDialog } = useCheckInSuccessDialog();
 *
 * // 當需要顯示對話框時
 * const result = await openSuccessDialog();
 * if (result.value === "complete") {
 *   await handleComplete();
 * }
 * ```
 */
export function useCheckInSuccessDialog({ from = 0, to = 100 }: UseCheckInSuccessDialogOptions) {
  const t = useTranslations("check_in");
  const { open, update } = useDialogManager();

  const openSuccessDialog = useCallback(
    (
      dynamicFrom?: number,
      dynamicTo?: number,
      encouragement?: string,
      initialMood: MoodTypeValue | null = null,
      onMoodChange?: (mood: MoodTypeValue) => void
    ): Promise<{ value: "complete" | "close"; index: number }> => {
      const finalFrom = dynamicFrom !== undefined ? dynamicFrom : from;
      const finalTo = dynamicTo !== undefined ? dynamicTo : to;
      return new Promise((resolve) => {
        const complete = () => resolve({ value: "complete", index: 0 });
        let dialogId = "";
        const { id } = open({
          title: t("success_title"),
          content: (
            <div className="p-4 text-text-dark">
              <CheckInSuccessContent
                from={finalFrom}
                to={finalTo}
                encouragement={encouragement}
                initialMood={initialMood}
                onMoodChange={(mood) => {
                  onMoodChange?.(mood);
                  update(dialogId, {
                    actions: [
                      {
                        label: t("success_complete"),
                        variant: "orange",
                        disabled: false,
                        onClick: complete,
                      },
                    ],
                  });
                }}
              />
            </div>
          ),
          actions: [
            {
              label: t("success_complete"),
              variant: "orange",
              disabled: true,
              onClick: complete,
            },
          ],
          dismissible: true,
          closeOnEscape: true,
          showCloseButton: true,
          onClose: () => resolve({ value: "close", index: -1 }),
        });
        dialogId = id;
      });
    },
    [open, update, from, to, t]
  );

  return { openSuccessDialog };
}
