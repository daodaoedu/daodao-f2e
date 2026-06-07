"use client";

import { useTranslations } from "@daodao/i18n";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { cn } from "@daodao/ui/lib/utils";
import { BookOpen, Gamepad2, Hammer, MessageCircle, Users, Video } from "lucide-react";
import type { ComponentType } from "react";
import { LEARNING_TOOL_OPTIONS, type LearningTool } from "@/constants/learning-tool";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Video,
  BookOpen,
  Hammer,
  Users,
  MessageCircle,
  Gamepad2,
};

interface LearningToolSelectorProps {
  value: LearningTool[];
  onChange: (value: LearningTool[]) => void;
  showLabel?: boolean;
}

export function LearningToolSelector({
  value,
  onChange,
  showLabel = true,
}: LearningToolSelectorProps) {
  const t = useTranslations("learning_harness");

  return (
    <div>
      {showLabel && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-medium text-text-dark">
            {t("learning_tool_selector_label")}
          </span>
          <span className="text-sm text-light-gray">{t("learning_tool_selector_hint")}</span>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {LEARNING_TOOL_OPTIONS.map((option) => {
          const isSelected = value.includes(option.value);
          const Icon = ICON_MAP[option.icon];
          const inputId = `learning-tool-${option.value}`;
          const label = t(option.labelKey);
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-colors cursor-pointer bg-white text-text-dark",
                isSelected
                  ? "border-logo-cyan text-logo-cyan"
                  : "border-transparent hover:border-bg-gray"
              )}
            >
              <Checkbox
                id={inputId}
                checked={isSelected}
                onCheckedChange={(checked) => {
                  const newValue = checked
                    ? [...value, option.value]
                    : value.filter((v) => v !== option.value);
                  onChange(newValue);
                }}
                className="sr-only"
                aria-label={label}
              />
              {Icon && (
                <Icon className={cn("size-6", isSelected ? "text-logo-cyan" : "text-light-gray")} />
              )}
              <span className="text-sm font-medium whitespace-nowrap">{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
