"use client";

import type { PracticeSummary } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import { Heart, Lightbulb, Sprout, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";
import type { PracticeStage } from "../hooks";
import { isInsightUnlocked, useInsightFeedback } from "../hooks";

interface AiInsightCardProps {
  summary: PracticeSummary;
  stage: PracticeStage;
}

const SECTION_META_KEYS: string[] = [
  "summary_insight_section_1",
  "summary_insight_section_2",
  "summary_insight_section_3",
];

const SECTION_ICONS: ComponentType<{ className?: string }>[] = [Lightbulb, Sprout, Star];

/** 送 API 儲存的原始值（作為識別碼）→ 顯示用 i18n key */
const NEGATIVE_REASONS = ["不是我的感受", "語氣不對", "太籠統", "建議不好"];
const NEGATIVE_REASON_KEYS: Record<string, string> = {
  不是我的感受: "summary_insight_reason_not_feeling",
  語氣不對: "summary_insight_reason_wrong_tone",
  太籠統: "summary_insight_reason_too_vague",
  建議不好: "summary_insight_reason_bad_suggestion",
};

/** 將 AI 洞察文字拆成最多 3 段，若原始文字沒有明顯分段則整段顯示 */
function splitInsight(insight: string): string[] {
  const paragraphs = insight
    .split(/\n{2,}|\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length > 0) {
    return paragraphs.slice(0, 3);
  }
  return [insight];
}

type FeedbackState = "idle" | "positive" | "negative-panel";

/**
 * AI 洞察卡片
 * @description 依 isInsightUnlocked() 顯示已解鎖的三段洞察，或鎖定狀態的模糊預覽 + 浮動說明卡
 */
export function AiInsightCard({ summary, stage }: AiInsightCardProps) {
  const t = useTranslations("practice");
  const unlocked = isInsightUnlocked(summary);
  const { save } = useInsightFeedback(summary.practiceId);

  const [feedbackState, setFeedbackState] = useState<FeedbackState>(
    summary.insightFeedback?.type === "positive"
      ? "positive"
      : summary.insightFeedback?.type === "negative"
        ? "negative-panel"
        : "idle"
  );
  const [selectedReasons, setSelectedReasons] = useState<string[]>(
    summary.insightFeedback?.reasons ?? []
  );

  const handlePositive = () => {
    setFeedbackState("positive");
    void save("positive");
  };

  const handleNegativeOpen = () => {
    setFeedbackState("negative-panel");
  };

  const toggleReason = (reason: string) => {
    const next = selectedReasons.includes(reason)
      ? selectedReasons.filter((item) => item !== reason)
      : [...selectedReasons, reason];
    setSelectedReasons(next);
    void save("negative", next);
  };

  if (!unlocked) {
    return (
      <section className="relative mt-4 overflow-hidden rounded-2xl border border-basic-200 p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none select-none space-y-3 opacity-45 blur-[5px]"
        >
          <div className="h-4 w-24 rounded bg-basic-200" />
          <div className="h-3 w-full rounded bg-basic-100" />
          <div className="h-3 w-5/6 rounded bg-basic-100" />
          <div className="h-3 w-full rounded bg-basic-100" />
          <div className="h-3 w-2/3 rounded bg-basic-100" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-5">
          <div className="w-full max-w-[280px] rounded-2xl bg-white p-5 text-center shadow-lg">
            {stage === "ended-low" ? (
              <>
                <Heart className="mx-auto size-6 text-logo-cyan" />
                <p className="mt-2 text-sm font-semibold text-text-dark">
                  {t("summary_insight_encouragement_title")}
                </p>
                <p className="mt-1 text-xs text-logo-gray">
                  {summary.encouragementText || t("summary_insight_encouragement_default")}
                </p>
              </>
            ) : (
              <>
                <Sprout className="mx-auto size-6 text-logo-cyan" />
                <p className="mt-2 text-sm font-semibold text-text-dark">
                  {t("summary_insight_locked_title")}
                </p>
                <p className="mt-1 text-xs text-logo-gray">
                  {t("summary_insight_locked_desc")}
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  const paragraphs = splitInsight(summary.insight ?? summary.encouragementText ?? "");

  return (
    <section className="mt-4 rounded-2xl border border-basic-200 p-5">
      {paragraphs.map((text, index) => {
        const titleKey = SECTION_META_KEYS[index] ?? SECTION_META_KEYS[SECTION_META_KEYS.length - 1]!;
        const Icon = SECTION_ICONS[index] ?? SECTION_ICONS[SECTION_ICONS.length - 1]!;
        const isLast = index === paragraphs.length - 1;

        return (
          <div
            key={titleKey}
            className={cn("py-3 first:pt-0 last:pb-0", !isLast && "border-b border-basic-100")}
          >
            <div className="flex items-center gap-1.5">
              <Icon className="size-4 text-logo-cyan" />
              <h3 className="text-sm font-semibold text-text-dark">{t(titleKey as any)}</h3>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-text-dark/80">{text}</p>
          </div>
        );
      })}

      <div className="mt-3 border-t border-basic-100 pt-3">
        {feedbackState === "positive" && (
          <p className="text-xs text-logo-gray">{t("summary_insight_feedback_thanks")}</p>
        )}

        {feedbackState === "negative-panel" && (
          <div>
            <div className="flex flex-wrap gap-2">
              {NEGATIVE_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => toggleReason(reason)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    selectedReasons.includes(reason)
                      ? "border-logo-cyan bg-primary-lightest text-text-dark"
                      : "border-basic-200 text-logo-gray"
                  )}
                >
                  {t(NEGATIVE_REASON_KEYS[reason] as any)}
                </button>
              ))}
            </div>
            {selectedReasons.length > 0 && (
              <p className="mt-2 text-xs text-logo-gray">{t("summary_insight_feedback_thanks")}</p>
            )}
          </div>
        )}

        {feedbackState === "idle" && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-logo-gray">{t("summary_insight_feedback_prompt")}</span>
            <button
              type="button"
              onClick={handlePositive}
              className="flex items-center gap-1 rounded-full border border-basic-200 px-3 py-1 text-xs text-text-dark transition-colors hover:border-logo-cyan"
            >
              <ThumbsUp className="size-3.5" />
              {t("summary_insight_feedback_positive")}
            </button>
            <button
              type="button"
              onClick={handleNegativeOpen}
              className="flex items-center gap-1 rounded-full border border-basic-200 px-3 py-1 text-xs text-text-dark transition-colors hover:border-logo-cyan"
            >
              <ThumbsDown className="size-3.5" />
              {t("summary_insight_feedback_negative")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
