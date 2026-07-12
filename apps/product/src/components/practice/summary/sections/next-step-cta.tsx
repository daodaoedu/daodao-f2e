"use client";

import type { PracticeSummary } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { ArrowRight, Heart, Sprout } from "lucide-react";
import type { PracticeStage } from "../hooks";
import { isEnded } from "../hooks";

interface NextStepCtaProps {
  stage: PracticeStage;
  onSurfaceChange: (surface: 2 | 3) => void;
  summary: PracticeSummary;
}

/**
 * Surface 1 底部的下一步 CTA 區塊
 * @description 分隔線 + 「接下來我想」／「製作分享卡」入口 + ending 溫和提示 + Footer 匯出連結
 */
export function NextStepCta({ stage, onSurfaceChange, summary }: NextStepCtaProps) {
  const t = useTranslations("practice");
  const ended = isEnded(stage);
  const hasCheckIns = summary.checkInCount > 0;

  const handleExport = () => {
    toast(t("summary_cta_export_coming_soon"));
  };

  return (
    <section className="mt-6">
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-basic-200" />
        <span className="shrink-0 text-xs text-logo-gray">
          {ended ? t("summary_cta_next_step") : t("summary_cta_unlock_after_end")}
        </span>
        <hr className="flex-1 border-basic-200" />
      </div>

      <button
        type="button"
        onClick={() => onSurfaceChange(2)}
        disabled={!ended}
        className={cn(
          "mt-4 flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 p-4 text-left transition-opacity",
          !ended && "pointer-events-none opacity-40"
        )}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/70">
          <Sprout className="size-5 text-amber-700" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-text-dark">
            {t("summary_cta_what_next")}
          </span>
          <span className="mt-0.5 block text-xs text-logo-gray">
            {t("summary_cta_what_next_desc")}
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-amber-700" />
      </button>

      <button
        type="button"
        onClick={() => onSurfaceChange(3)}
        disabled={!ended}
        className={cn(
          "mt-3 flex w-full items-center justify-between rounded-2xl border border-basic-200 bg-transparent p-4 text-left transition-opacity",
          !ended && "pointer-events-none opacity-40"
        )}
      >
        <span className="text-sm font-medium text-text-dark">{t("summary_cta_share_prompt")}</span>
        <ArrowRight className="size-4 shrink-0 text-logo-gray" />
      </button>

      {stage === "ending" && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary-lighter bg-primary-palest p-4">
          <Heart className="mt-0.5 size-4 shrink-0 text-logo-cyan" />
          <p className="text-xs leading-relaxed text-text-dark/80">
            {t("summary_cta_ending_hint")}
          </p>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-xs text-logo-gray">{t("summary_cta_completed_hint")}</p>
        <button
          type="button"
          onClick={handleExport}
          disabled={!hasCheckIns}
          className="mt-2 text-xs text-logo-gray underline underline-offset-2 disabled:opacity-40"
        >
          {t("summary_cta_export")}
        </button>
      </div>
    </section>
  );
}
