"use client";

import { cn } from "@daodao/ui/lib/utils";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export const CircularProgress = ({
  value,
  size = 60,
  strokeWidth = 4,
  className,
  showText = true,
  textClassName,
}: CircularProgressProps) => {
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
        aria-label={`進度 ${Math.round(value)}%`}
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
            "absolute inset-0 flex items-center justify-center text-lg font-semibold text-logo-cyan",
            textClassName
          )}
        >
          {Math.round(value)}%
        </div>
      )}
    </div>
  );
};
