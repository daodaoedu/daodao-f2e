"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  caption?: string;
  ariaLabel?: string;
}

export const CircularProgress = ({
  value,
  size = 60,
  strokeWidth = 4,
  className,
  showText = true,
  textClassName,
  caption,
  ariaLabel,
}: CircularProgressProps) => {
  const t = useTranslations("practice");
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="img"
        aria-label={ariaLabel ?? t("progress_aria", { value: Math.round(value) })}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-bg-gray"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-logo-cyan transition-all duration-500 ease-in-out"
        />
      </svg>
      {showText && (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center font-semibold text-logo-cyan",
            textClassName
          )}
        >
          {caption && (
            <span className="text-[9px] font-medium leading-tight text-text-dark/70">
              {caption}
            </span>
          )}
          <span className={caption ? "text-sm leading-tight" : "text-lg"}>{Math.round(value)}%</span>
        </div>
      )}
    </div>
  );
};
