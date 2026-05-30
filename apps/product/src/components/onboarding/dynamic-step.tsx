"use client";

import type { OnboardingFlowStep } from "@daodao/api";
import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { OnboardingFormValues } from "./schema";

interface DynamicStepProps {
  step: OnboardingFlowStep;
  form: UseFormReturn<OnboardingFormValues>;
  error?: string | null;
}

/**
 * 動態 Onboarding 步驟元件
 * 依 questionType 渲染不同的輸入 UI：
 * - single：單選 Badge
 * - multi：多選 Badge
 * - text：文字輸入
 */
export const DynamicStep = ({ step, form, error }: DynamicStepProps) => {
  const allAnswers = form.watch("dynamicAnswers") ?? {};
  const answers = allAnswers[step.id.toString()] ?? [];

  const setAnswers = (newAnswers: string[]) => {
    const current = form.getValues("dynamicAnswers") ?? {};
    form.setValue(
      "dynamicAnswers",
      { ...current, [step.id.toString()]: newAnswers },
      { shouldValidate: false }
    );
  };

  const toggle = (value: string) => {
    if (step.questionType === "single") {
      setAnswers([value]);
    } else {
      const isSelected = answers.includes(value);
      setAnswers(isSelected ? answers.filter((v) => v !== value) : [...answers, value]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="heading-lg text-text-dark mb-2">{step.questionText}</h1>
        {step.questionType === "multi" && (
          <p className="text-sm text-light-gray">可選擇多個選項</p>
        )}
      </div>

      {(step.questionType === "single" || step.questionType === "multi") && (
        <div className="flex flex-wrap gap-2">
          {step.options.map((option) => {
            const isSelected = answers.includes(option);
            return (
              <Badge
                key={option}
                variant={isSelected ? "outline-blue" : "outline-ghost"}
                className={cn(
                  "cursor-pointer transition-all px-4 py-2 rounded-lg",
                  isSelected && "border-logo-cyan bg-light-blue"
                )}
                onClick={() => toggle(option)}
              >
                {option}
              </Badge>
            );
          })}
        </div>
      )}

      {step.questionType === "text" && (
        <textarea
          value={answers[0] ?? ""}
          onChange={(e) => setAnswers([e.target.value])}
          className="w-full min-h-[120px] rounded-lg border border-light-gray bg-white px-4 py-3 text-sm text-text-dark placeholder:text-light-gray focus:border-logo-cyan focus:outline-none resize-none"
          placeholder="請輸入你的回答..."
        />
      )}

      {error && <p className="text-sm text-red">{error}</p>}
    </div>
  );
};
