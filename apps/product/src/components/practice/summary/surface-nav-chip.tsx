"use client";

import { useTranslations } from "@daodao/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Check, ChevronDown, FileText, Image, Sprout } from "lucide-react";
import type { ComponentType } from "react";
import type { PracticeStage } from "./hooks";
import { isEnded } from "./hooks";

interface SurfaceNavChipProps {
  currentSurface: 1 | 2 | 3;
  stage: PracticeStage;
  onSurfaceChange: (surface: 1 | 2 | 3) => void;
}

interface SurfaceOption {
  surface: 1 | 2 | 3;
  icon: ComponentType<{ className?: string }>;
  chipClassName: string;
}

/**
 * 三個 Surface 的選項設定
 * @description Surface 1（實踐總結）永遠可用；Surface 2/3 需在實踐結束後才解鎖
 */
const DEFAULT_SURFACE_OPTION: SurfaceOption = {
  surface: 1,
  icon: FileText,
  chipClassName: "bg-light-cyan text-logo-cyan",
};

const SURFACE_OPTIONS: SurfaceOption[] = [
  DEFAULT_SURFACE_OPTION,
  {
    surface: 2,
    icon: Sprout,
    chipClassName: "bg-logo-yellow/25 text-[#8a6d00]",
  },
  {
    surface: 3,
    icon: Image,
    chipClassName: "bg-emerald-100 text-emerald-700",
  },
];

/**
 * Surface 切換用的膠囊狀導覽 Chip
 * @description 顯示目前所在的 surface，點擊展開下拉選單切換；Surface 2/3 在未結束前呈現灰階並禁止切換
 */
export function SurfaceNavChip({ currentSurface, stage, onSurfaceChange }: SurfaceNavChipProps) {
  const t = useTranslations("practice");

  const surfaceNames: Record<1 | 2 | 3, string> = {
    1: t("summary_nav_s1_name"),
    2: t("summary_nav_s2_name"),
    3: t("summary_nav_s3_name"),
  };

  const surfaceDescs: Record<1 | 2 | 3, string> = {
    1: t("summary_nav_s1_desc"),
    2: t("summary_nav_s2_desc"),
    3: t("summary_nav_s3_desc"),
  };

  const ended = isEnded(stage);
  const current =
    SURFACE_OPTIONS.find((option) => option.surface === currentSurface) ?? DEFAULT_SURFACE_OPTION;
  const CurrentIcon = current.icon;

  const handleSelect = (surface: 1 | 2 | 3) => {
    if (surface !== 1 && !ended) {
      toast.error(t("summary_nav_locked_toast"));
      return;
    }
    onSurfaceChange(surface);
  };

  return (
    <div className="sticky top-4 z-30 flex justify-center pt-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-colors",
              current.chipClassName
            )}
          >
            <CurrentIcon className="size-4" />
            <span>{surfaceNames[current.surface]}</span>
            <ChevronDown className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-72 p-2">
          {SURFACE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const locked = option.surface !== 1 && !ended;
            const isCurrent = option.surface === currentSurface;

            return (
              <DropdownMenuItem
                key={option.surface}
                onClick={() => handleSelect(option.surface)}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2.5",
                  locked && "opacity-40 hover:bg-transparent"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    option.chipClassName
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 text-left">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-dark">
                      {surfaceNames[option.surface]}
                    </span>
                    {isCurrent && <Check className="size-3.5 text-logo-cyan" />}
                  </span>
                  <span className="block text-xs text-text-dark/60">
                    {surfaceDescs[option.surface]}
                  </span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
