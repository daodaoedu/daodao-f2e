"use client";

import { useTranslations } from "@daodao/i18n";
import { motion, useReducedMotion } from "motion/react";
import { MOOD_DISPLAY_OPTIONS, type MoodType } from "@/constants/mood";
import type { IMoodStat } from "../types";

/** Match each segment to the background of its mood icon. */
const MOOD_BAR_COLORS: Record<MoodType, string> = {
  hopeless: "bg-[#A7A8AC]",
  frustrated: "bg-[#98E4F1]",
  bored: "bg-[#AFD24B]",
  neutral: "bg-[#DEDBFF]",
  fine: "bg-[#FFDACE]",
  happy: "bg-[#F9DA4C]",
};

export function MoodDistributionChart({ moods }: { moods: readonly IMoodStat[] }) {
  const t = useTranslations("practice");
  const checkInT = useTranslations("check_in");
  const prefersReducedMotion = useReducedMotion() ?? false;
  const visibleMoods = moods.filter(({ count }) => count > 0);
  const total = visibleMoods.reduce((sum, { count }) => sum + count, 0);

  if (total === 0) {
    return <p className="mt-3 text-sm text-logo-gray">{t("summary_stats_no_mood")}</p>;
  }

  return (
    <figure className="mt-3" aria-label={t("summary_stats_mood_distribution")}>
      <ul className="flex h-2.5 overflow-hidden rounded-full bg-black/5" aria-hidden="true">
        {visibleMoods.map(({ mood, count }, index) => (
          <motion.li
            key={mood}
            initial={prefersReducedMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.9,
              delay: prefersReducedMotion ? 0 : 0.12 + index * 0.1,
              ease: "easeOut",
            }}
            style={{ width: `${(count / total) * 100}%`, transformOrigin: "left center" }}
            className={MOOD_BAR_COLORS[mood]}
          />
        ))}
      </ul>
      <figcaption className="mt-3">
        <ul
          className="grid text-[0.6875rem] text-logo-gray"
          style={{
            gridTemplateColumns: visibleMoods
              .map(({ count }) => `minmax(min-content, ${count}fr)`)
              .join(" "),
          }}
        >
          {visibleMoods.map(({ mood, count }) => {
            const Icon = MOOD_DISPLAY_OPTIONS.find(({ id }) => id === mood)?.emoji;
            return (
              <li key={mood} className="flex flex-col items-center gap-1 px-0.5 text-center">
                {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
                {checkInT(`moods.${mood}`)}
                <small className="sr-only">{` (${count})`}</small>
              </li>
            );
          })}
        </ul>
      </figcaption>
    </figure>
  );
}
