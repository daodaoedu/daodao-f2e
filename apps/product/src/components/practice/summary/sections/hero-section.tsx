"use client";

import type { MoodType, PracticeSummary } from "@daodao/api";
import {
  BoredSvg,
  FineSvg,
  FrustratedSvg,
  HappySvg,
  HopelessSvg,
  NeutralSvg,
} from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { ConfettiAnimation } from "@daodao/ui/components/confetti-animation";
import { cn } from "@daodao/ui/lib/utils";
import { motion } from "motion/react";
import type { PracticeStage } from "../hooks";

interface HeroSectionProps {
  summary: PracticeSummary;
  stage: PracticeStage;
}

/** 心情類型對應的插畫圖標 */
const MOOD_ICONS: Record<MoodType, typeof HappySvg> = {
  happy: HappySvg,
  good: FineSvg,
  neutral: NeutralSvg,
  bored: BoredSvg,
  frustrated: FrustratedSvg,
  give_up: HopelessSvg,
};

/** 心情類型對應的 i18n key（供 aria-label 使用） */
const MOOD_LABEL_KEYS: Record<MoodType, string> = {
  happy: "summary_hero_mood_happy",
  good: "summary_hero_mood_good",
  neutral: "summary_hero_mood_neutral",
  bored: "summary_hero_mood_bored",
  frustrated: "summary_hero_mood_frustrated",
  give_up: "summary_hero_mood_give_up",
};

/** 各 stage 對應的 Badge i18n key 與樣式 */
const BADGE_CONFIG: Record<PracticeStage, { textKey: string; className: string }> = {
  active: { textKey: "summary_hero_badge_active", className: "bg-amber-100 text-amber-800" },
  ending: { textKey: "summary_hero_badge_active", className: "bg-amber-100 text-amber-800" },
  "ended-deep": { textKey: "summary_hero_badge_ended_deep", className: "bg-primary-lightest text-text-dark" },
  "ended-low": { textKey: "summary_hero_badge_ended_low", className: "bg-primary-lightest text-text-dark" },
};

/** 泡泡圓的大小與底色（由外到內遞減） */
const BUBBLE_SIZES = [56, 48, 40];
const BUBBLE_STYLES = [
  "bg-light-blue",
  "bg-basic-100 border border-basic-200",
  "bg-white border border-basic-200",
];

function getHeroTitleKey(stage: PracticeStage): string | null {
  switch (stage) {
    case "ended-deep":
      return "summary_hero_title_ended_deep";
    case "ended-low":
      return "summary_hero_title_ended_low";
    default:
      return null;
  }
}

function getHeroSubtitleKey(stage: PracticeStage): string | null {
  switch (stage) {
    case "active":
      return "summary_hero_subtitle_active";
    case "ending":
      return "summary_hero_subtitle_ending";
    case "ended-deep":
      return "summary_hero_subtitle_ended_deep";
    case "ended-low":
      return "summary_hero_subtitle_ended_low";
    default:
      return null;
  }
}

/** 從打卡筆記截取簡短文字，用於關鍵詞泡泡圓（無獨立關鍵詞資料時的近似呈現） */
function getBubbleText(note: string): string {
  const trimmed = note.trim();
  return trimmed.length > 6 ? `${trimmed.slice(0, 6)}…` : trimmed;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/**
 * Surface 1 的 Hero 區塊
 * @description 顯示放射狀背景裝飾、吉祥物頭像、stage badge、標題副標與成長足跡統計
 */
export function HeroSection({ summary, stage }: HeroSectionProps) {
  const t = useTranslations("practice");
  const badge = BADGE_CONFIG[stage];
  const titleKey = getHeroTitleKey(stage);
  const title = titleKey ? t(titleKey as any) : summary.practiceName;
  const subtitleKey = getHeroSubtitleKey(stage);
  const subtitle = subtitleKey ? t(subtitleKey as any) : "";
  const bubbleNotes = summary.topNotes.slice(0, 3);

  return (
    <section className="relative overflow-hidden pt-8">
      <style>{`
        @keyframes float-dots {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {stage === "ended-deep" && <ConfettiAnimation />}

      {/* 放射狀 SVG 背景裝飾 */}
      <svg
        className="pointer-events-none absolute -top-10 left-1/2 h-[280px] w-[280px] -translate-x-1/2 text-logo-cyan/10"
        viewBox="0 0 280 280"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="140" cy="140" r="140" fill="currentColor" />
        <circle cx="140" cy="140" r="100" fill="currentColor" />
        <circle cx="140" cy="140" r="60" fill="currentColor" />
      </svg>

      {/* 浮動裝飾圓點 */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span
          className="absolute left-6 top-6 size-2 animate-[float-dots_3s_ease-in-out_infinite] rounded-full bg-mascot-aqua/60"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="absolute right-16 top-14 size-1.5 animate-[float-dots_3s_ease-in-out_infinite] rounded-full bg-logo-yellow/70"
          style={{ animationDelay: "0.6s" }}
        />
        <span
          className="absolute left-14 top-24 size-1 animate-[float-dots_3s_ease-in-out_infinite] rounded-full bg-logo-cyan/50"
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      {/* 吉祥物頭像 */}
      <div className="absolute right-0 top-6 flex size-12 items-center justify-center rounded-full bg-primary-lightest text-lg font-bold text-text-dark">
        {t("summary_mascot_label")}
      </div>

      <motion.div className="relative" variants={containerVariants} initial="hidden" animate="show">
        <motion.span
          variants={itemVariants}
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
            badge.className
          )}
        >
          {t(badge.textKey as any)}
        </motion.span>

        <motion.h1 variants={itemVariants} className="mt-3 text-2xl font-bold text-text-dark">
          {title}
        </motion.h1>

        <motion.p variants={itemVariants} className="mt-1 text-sm text-logo-gray">
          {subtitle}
        </motion.p>

        {/* 成長足跡統計區 */}
        <motion.div
          variants={itemVariants}
          className="relative mt-5 overflow-hidden rounded-2xl bg-primary-palest p-5"
        >
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <p className="text-[28px] font-bold leading-none text-text-dark">
                {summary.checkInCount}
                <span className="ml-1 text-sm font-medium text-logo-gray">
                  {t("summary_hero_checkin_unit")}
                </span>
              </p>
            </div>

            {bubbleNotes.length > 0 && (
              <div className="flex flex-1 items-end justify-center gap-2">
                {bubbleNotes.map((note, index) => (
                  <div
                    key={`bubble-${index}-${note.slice(0, 4)}`}
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-full text-center text-[11px] leading-tight text-text-dark",
                      BUBBLE_STYLES[index]
                    )}
                    style={{ width: BUBBLE_SIZES[index], height: BUBBLE_SIZES[index] }}
                  >
                    <span className="px-1">{getBubbleText(note)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {summary.topMoods.length > 0 && (
            <div className="mt-4 flex items-center gap-2 border-t border-basic-200/60 pt-3">
              <span className="text-[11px] text-logo-gray">{t("summary_hero_moods_label")}</span>
              <div className="flex items-center gap-1.5">
                {summary.topMoods.map((moodStat) => {
                  const MoodIcon = MOOD_ICONS[moodStat.mood];
                  if (!MoodIcon) return null;
                  return (
                    <MoodIcon
                      key={moodStat.mood}
                      className="size-6"
                      aria-label={t(MOOD_LABEL_KEYS[moodStat.mood] as any)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
