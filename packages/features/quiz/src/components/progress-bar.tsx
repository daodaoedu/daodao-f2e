"use client";

import RunnerSvg from "@daodao/assets/images/quiz/runner.svg";
import { Progress } from "@daodao/ui/components/progress";
import { cn } from "@daodao/ui/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressBar = ({ currentStep, totalSteps, className }: ProgressBarProps) => {
  const stepNumber = 100 / (totalSteps + 1);
  const percent = currentStep * stepNumber;

  return (
    <div className={cn("absolute inset-x-0 top-0.5 z-10 text-[#545454]", className)}>
      <RunnerSvg
        className="absolute top-0 left-0 transition-transform will-change-transform"
        style={{ transform: `translateX(calc(392px / ${totalSteps + 1} * ${currentStep} - 16px))` }}
      />
      <Progress value={percent} className="mt-8 h-1 rounded-none [--active-color:#545454]" />
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((num) => (
        <div
          key={num}
          className={cn(
            "absolute top-7 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 transition-colors",
            currentStep >= num ? "bg-[#545454]" : "bg-[#B5B5B5]"
          )}
          style={{ left: `${num * stepNumber}%` }}
        />
      ))}
    </div>
  );
};
