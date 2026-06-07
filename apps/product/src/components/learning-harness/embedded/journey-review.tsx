"use client";

import { FineSvg, HappySvg, NeutralSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import type { ElementType } from "react";

const API_MOOD_TO_SVG: Record<string, ElementType> = {
  good: FineSvg,
  happy: HappySvg,
  neutral: NeutralSvg,
};

interface JourneyReviewProps {
  moods: (string | undefined)[];
  topNotes: string[];
}

export function JourneyReview({ moods, topNotes }: JourneyReviewProps) {
  const t = useTranslations("learning_harness");

  const moodSvgs = moods
    .filter(Boolean)
    .slice(0, 12)
    .map((m) => API_MOOD_TO_SVG[m as string] ?? NeutralSvg);

  return (
    <div className="space-y-4">
      {topNotes.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <p className="text-xs font-medium text-light-gray mb-2">
            {t("observe_reflection_title")}
          </p>
          <div className="space-y-2">
            {topNotes.slice(0, 3).map((note) => (
              <p key={note} className="text-xs text-text-dark italic leading-relaxed line-clamp-2">
                「{note}」
              </p>
            ))}
          </div>
        </div>
      )}

      {moodSvgs.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
          <p className="text-xs font-medium text-light-gray mb-2">{t("observe_mood_arc_title")}</p>
          <div className="flex items-center gap-1 flex-wrap">
            {moodSvgs.map((Emoji, i) => (
              <Emoji key={`m-${i + 1}`} className="size-5" />
            ))}
          </div>
          <p className="text-[10px] text-light-gray mt-2">{t("observe_mood_arc_desc")}</p>
        </div>
      )}
    </div>
  );
}
