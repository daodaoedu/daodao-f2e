"use client";

import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@daodao/ui/components/animate-ui/components/base/tooltip";
import { SplitText } from "@daodao/ui/components/split-text";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { cn } from "@daodao/ui/lib/utils";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

interface UseCheckInSuccessDialogOptions {
  title: string;
  from?: number;
  to?: number;
}

interface DelayedSplitTextProps {
  title: string;
  onLetterAnimationComplete: () => void;
}

/**
 * 延遲啟用動畫的 SplitText 包裝組件
 */
function DelayedSplitText({ title, onLetterAnimationComplete }: DelayedSplitTextProps) {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(false);

  useEffect(() => {
    // 等待彈窗打開動畫完成後再啟用文字動畫（約 350ms）
    const timer = setTimeout(() => {
      setIsAnimationEnabled(true);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!isAnimationEnabled) return null;

  return (
    <SplitText
      text={title}
      className="text-xl font-semibold text-text-dark"
      delay={100}
      duration={0.3}
      ease="power3.out"
      splitType="chars"
      from={{ opacity: 0, y: 6 }}
      to={{ opacity: 1, y: 0 }}
      threshold={0.1}
      rootMargin="-100px"
      textAlign="center"
      onLetterAnimationComplete={onLetterAnimationComplete}
    />
  );
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
  onAnimationComplete?: () => void;
}

/**
 * 始終保持開啟的 Tooltip 組件
 */
function AlwaysOpenTooltip({
  from,
  to,
  shouldStartAnimation = true,
  onAnimationComplete,
}: AlwaysOpenTooltipProps) {
  const [percentage, setPercentage] = useState(from);
  const [isAnimated, setIsAnimated] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (from >= to) return;
    if (!shouldStartAnimation) return;

    // 當動畫完成時觸發煙火效果
    if (percentage >= to && !isAnimated) {
      setIsAnimated(true);
      setShowFireworks(true);
      onAnimationComplete?.();
    }

    // 如果已經完成動畫，不再執行進度更新
    if (isAnimated) return;

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
  }, [from, to, percentage, isAnimated, shouldStartAnimation, onAnimationComplete]);

  return (
    <Tooltip alwaysOpen open>
      <div className="absolute bottom-[167px] left-12 right-12 h-[12px] bg-very-light-gray rounded-full">
        <div
          className="w-full h-full bg-linear-90 from-blue to-logo-cyan rounded-full origin-left"
          style={{ transform: `scaleX(${percentage}%)` }}
        />
        <TooltipTrigger
          render={
            <div
              className="absolute top-0 h-full aspect-square -translate-x-1/2"
              style={{ left: `${percentage}%` }}
            >
              {showFireworks && <Fireworks />}
            </div>
          }
        />
      </div>
      <TooltipPanel
        sideOffset={20}
        side="top"
        className="bg-logo-cyan text-white font-bold text-3xl py-2 rounded-full [--arrow-size:14px]"
      >
        {percentage}%
      </TooltipPanel>
    </Tooltip>
  );
}

interface Step1AnimationProps {
  title: string;
  from: number;
  to: number;
}

function Step1Animation({ title, from, to }: Step1AnimationProps) {
  const [showProgress, setShowProgress] = useState(false);
  const [shouldStartAnimation, setShouldStartAnimation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (showProgress && !isFinished) {
      const timer = setTimeout(() => {
        setShouldStartAnimation(true);
      }, 300);

      return () => {
        clearTimeout(timer);
      };
    }
    if (isFinished && !isHidden) {
      const timer = setTimeout(() => {
        setIsHidden(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [showProgress, isFinished, isHidden]);

  return (
    <div
      className={cn(
        "absolute top-[72px] bottom-0 inset-x-0 bg-white rounded-3xl px-4 pb-4 z-10 transition-opacity",
        isHidden && "opacity-0 pointer-events-none"
      )}
    >
      <div className="mx-auto w-fit">
        <DelayedSplitText title={title} onLetterAnimationComplete={() => setShowProgress(true)} />
      </div>
      {showProgress && !isHidden && (
        <AlwaysOpenTooltip
          from={from}
          to={to}
          shouldStartAnimation={shouldStartAnimation}
          onAnimationComplete={() => setIsFinished(true)}
        />
      )}
    </div>
  );
}

function Step2Animation() {
  return (
    <div className="space-y-1">
      <p>恭喜，你又成功行動了一次！</p>
      <p>歡迎分享你的心得，和你有相同實踐的人會很想知道喔！</p>
    </div>
  );
}

interface CheckInSuccessContentProps {
  title: string;
  from: number;
  to: number;
}

function CheckInSuccessContent({ title, from, to }: CheckInSuccessContentProps) {
  return (
    <>
      <Step1Animation title={title} from={from} to={to} />
      <Step2Animation />
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
export function useCheckInSuccessDialog({
  title,
  from = 0,
  to = 100,
}: UseCheckInSuccessDialogOptions) {
  const { openSuccessDialog: openDialog } = useDialog();

  const openSuccessDialog = useCallback(
    (dynamicFrom?: number, dynamicTo?: number) => {
      const finalFrom = dynamicFrom !== undefined ? dynamicFrom : from;
      const finalTo = dynamicTo !== undefined ? dynamicTo : to;
      return openDialog({
        title: "打卡成功!",
        message: <CheckInSuccessContent title={title} from={finalFrom} to={finalTo} />,
        textAlign: "left",
        buttons: [
          // { label: "分享心得", value: "share", variant: "outline" },
          { label: "完成", value: "complete", variant: "orange" },
        ],
      });
    },
    [openDialog, title, from, to],
  );

  return { openSuccessDialog };
}
