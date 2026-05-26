"use client";

import type { RoadmapStats } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";

interface RoadmapHeroProps {
  stats: RoadmapStats | null;
}

/** 以「N+」呈現的概數 */
function roundDown(n: number): number {
  if (n < 10) return n;
  if (n < 100) return Math.floor(n / 10) * 10;
  return Math.floor(n / 100) * 100;
}

export function RoadmapHero({ stats }: RoadmapHeroProps) {
  const t = useTranslations("roadmap");

  return (
    <section className="bg-gradient-to-b from-light-blue to-basic-white px-5 py-12 text-center">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-text-dark sm:text-4xl">{t("hero_title")}</h1>
        <p className="mt-4 text-base text-light-gray sm:text-lg">{t("hero_subtitle")}</p>
        {stats ? (
          <div className="mt-8 flex items-center justify-center gap-8">
            <div>
              <p className="text-2xl font-bold text-logo-cyan">{roundDown(stats.partners)}+</p>
              <p className="mt-1 text-sm text-light-gray">
                {t("hero_partners", { count: roundDown(stats.partners) })}
              </p>
            </div>
            <div className="h-10 w-px bg-light-gray/40" />
            <div>
              <p className="text-2xl font-bold text-logo-cyan">{roundDown(stats.feedback)}+</p>
              <p className="mt-1 text-sm text-light-gray">
                {t("hero_feedback", { count: roundDown(stats.feedback) })}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
