"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";

const DURATION_OPTIONS = [
  { days: "7", min: 1, max: 7 },
  { days: "14", min: 8, max: 14 },
  { days: "21", min: 15, max: 21 },
  { days: "30", min: 22, max: 30 },
];

const STATUS_VALUES = [
  { value: "active" as const },
  { value: "completed" as const },
];

export interface ShowcaseFilterState {
  tags: string[];
  durationMin?: number;
  durationMax?: number;
  status?: "active" | "completed";
}

interface ShowcaseFilterBarProps {
  filters: ShowcaseFilterState;
  onFiltersChange: (filters: ShowcaseFilterState) => void;
}

export function ShowcaseFilterBar({ filters, onFiltersChange }: ShowcaseFilterBarProps) {
  const t = useTranslations("showcase");

  const toggleStatus = (value: "active" | "completed") => {
    onFiltersChange({
      ...filters,
      status: filters.status === value ? undefined : value,
    });
  };

  const toggleDuration = (min: number, max: number) => {
    const isSelected = filters.durationMin === min && filters.durationMax === max;
    onFiltersChange({
      ...filters,
      durationMin: isSelected ? undefined : min,
      durationMax: isSelected ? undefined : max,
    });
  };

  return (
    <div className="flex flex-col gap-3 pt-2">
      {/* Status filter */}
      <div>
        <p className="text-xs text-text-dark/50 mb-1.5">{t("status_label")}</p>
        <div className="flex gap-2 flex-wrap">
          {STATUS_VALUES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleStatus(opt.value)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm border transition-colors",
                filters.status === opt.value
                  ? "bg-logo-cyan border-logo-cyan text-white"
                  : "bg-white border-[#C1ECFF] text-text-dark"
              )}
            >
              {opt.value === "active" ? t("status_active") : t("status_completed")}
            </button>
          ))}
        </div>
      </div>

      {/* Duration filter */}
      <div>
        <p className="text-xs text-text-dark/50 mb-1.5">{t("duration_label")}</p>
        <div className="flex gap-2 flex-wrap">
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = filters.durationMin === opt.min && filters.durationMax === opt.max;
            return (
              <button
                key={opt.days}
                type="button"
                onClick={() => toggleDuration(opt.min, opt.max)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm border transition-colors",
                  isSelected
                    ? "bg-logo-cyan border-logo-cyan text-white"
                    : "bg-white border-[#C1ECFF] text-text-dark"
                )}
              >
                {t("duration_days", { days: opt.days })}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
