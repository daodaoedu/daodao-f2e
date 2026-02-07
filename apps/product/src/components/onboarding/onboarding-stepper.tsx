"use client";

import { cn } from "@daodao/ui/lib/utils";
import { CheckIcon } from "lucide-react";

interface OnboardingStepperProps {
  /** 當前步驟 (1-4) */
  currentStep: number;
  /** 總步驟數 */
  totalSteps: number;
}

/**
 * Onboarding 步驟指示器
 * 顯示當前進度和步驟圓點
 */
export const OnboardingStepper = ({ currentStep, totalSteps }: OnboardingStepperProps) => {
  // 排除成功頁面，所以是 1-3 步驟
  const inputSteps = totalSteps - 1;

  // 成功頁面不顯示步驟指示器
  if (currentStep === totalSteps) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {Array.from({ length: inputSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = stepNumber === inputSteps;

          return (
            <div key={stepNumber} className="flex items-center">
              {/* 步驟圓點 */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center transition-all duration-300 text-sm font-medium",
                    isActive && "bg-logo-cyan text-white shadow-lg shadow-logo-cyan/30",
                    isCompleted && "bg-logo-cyan text-white",
                    !isActive && !isCompleted && "bg-basic-200 text-light-gray"
                  )}
                >
                  {isCompleted ? <CheckIcon className="size-4" /> : stepNumber}
                </div>
              </div>

              {/* 連接線 */}
              {!isLast && (
                <div
                  className={cn(
                    "w-16 sm:w-24 h-0.5 mx-2 transition-colors duration-300",
                    isCompleted ? "bg-logo-cyan" : "bg-basic-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
