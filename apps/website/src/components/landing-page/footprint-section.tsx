"use client";

import {
  BoredSvg,
  FineSvg,
  FrustratedSvg,
  HappySvg,
  HopelessSvg,
  NeutralSvg,
  NotebookHoleSvg,
  StampSvg,
} from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { AnimatePresence, motion } from "motion/react";
import { type ElementType, useCallback, useEffect, useRef, useState } from "react";

interface EmotionItem {
  key: string;
  labelKey: string;
  Icon: ElementType;
}

const EMOTIONS: EmotionItem[] = [
  { key: "hopeless", labelKey: "landing_footprint_mood_hopeless", Icon: HopelessSvg },
  { key: "frustrated", labelKey: "landing_footprint_mood_frustrated", Icon: FrustratedSvg },
  { key: "bored", labelKey: "landing_footprint_mood_bored", Icon: BoredSvg },
  { key: "neutral", labelKey: "landing_footprint_mood_neutral", Icon: NeutralSvg },
  { key: "fine", labelKey: "landing_footprint_mood_fine", Icon: FineSvg },
  { key: "happy", labelKey: "landing_footprint_mood_happy", Icon: HappySvg },
];

const THOUGHT_TAGS = ["實作", "新概念", "有趣", "困難", "下一步", "改進", "疑問"];
const SELECTED_TAGS = ["有趣", "下一步"];

/**
 * Animation timing (ms) per the design spec:
 * 1. Panel enters from bottom + exits down = 2s
 * 2. Blank = 1s
 * 3. Journal bg block enters diagonally = 0.5s
 * 4. Journal paper enters + holds = 3s
 * Total cycle ≈ 6.5s
 */
const PHASE_DURATIONS = {
  panel: 2000,
  blank: 1000,
  journal: 3500,
} as const;

type Phase = keyof typeof PHASE_DURATIONS;
const PHASE_ORDER: Phase[] = ["panel", "blank", "journal"];

function CheckInPanel({ t }: { t: (key: string) => string }) {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
      <h3 className="mb-4 text-lg font-bold text-primary-darker">自己準備便當</h3>

      {/* Emotion selector */}
      <p className="mb-3 text-sm font-medium text-basic-400">{t("landing_footprint_mood_label")}</p>
      <div className="mb-5 flex justify-between gap-1">
        {EMOTIONS.map((emotion) => (
          <div
            key={emotion.key}
            className={`flex flex-col items-center gap-1 rounded-lg p-1.5 ${
              emotion.key === "happy" ? "bg-primary-palest ring-2 ring-primary-base" : ""
            }`}
          >
            <emotion.Icon className="size-8" />
            <span className="text-[10px] text-basic-400">{t(emotion.labelKey)}</span>
          </div>
        ))}
      </div>

      {/* Thought tags */}
      <p className="mb-2 text-sm font-medium text-basic-400">
        {t("landing_footprint_thoughts_label")}
      </p>
      <div className="mb-5 flex flex-wrap gap-2">
        {THOUGHT_TAGS.map((tag) => {
          const isSelected = SELECTED_TAGS.includes(tag);
          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${
                isSelected ? "bg-basic-500 text-white" : "border border-basic-200 text-basic-400"
              }`}
            >
              {tag}
              {isSelected && <span className="text-[10px]">&times;</span>}
            </span>
          );
        })}
      </div>

      {/* Description */}
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-medium text-basic-400">
          {t("landing_footprint_description_label")}
        </p>
        <span className="text-xs text-basic-300">0/300</span>
      </div>
      <div className="rounded-lg border border-primary-lighter bg-white p-3 text-sm text-basic-400">
        挑戰完成了超美麗的日式便當，天啊太有成就感了吧！！下次要再開發一些新菜色～
      </div>
    </div>
  );
}

function JournalPaper() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-b-lg bg-white shadow-lg">
      {/* Notebook holes */}
      <NotebookHoleSvg className="w-full" />

      {/* Content */}
      <div className="relative px-5 pb-5 pt-4">
        {/* Lined paper effect */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 31px, #99ECFF 31px, #99ECFF 32px)",
            backgroundPositionY: "8px",
          }}
        />

        <div className="relative">
          {/* Stamp - positioned top-right */}
          <div className="absolute -right-1 top-0 animate-stamp">
            <StampSvg width={90} height={90} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold leading-tight text-logo-gray">2026</span>
              <span className="text-[9px] font-bold leading-tight text-logo-gray">01/01</span>
            </div>
          </div>

          {/* Emotion + label */}
          <div className="mb-3 flex items-center gap-2">
            <NeutralSvg className="size-6" />
            <span className="text-sm font-medium text-basic-500">心情普通</span>
          </div>

          {/* Journal text */}
          <p className="mb-4 max-w-[200px] text-sm font-medium leading-8 text-basic-500">
            挑戰完成了超美麗的日式便當，天啊太有成就感了吧！！下次要再開發一些新菜色～
          </p>

          {/* Tags */}
          <div className="flex gap-2">
            <span className="text-sm font-medium text-primary-base"># 有趣</span>
            <span className="text-sm font-medium text-primary-base"># 下一步</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FootprintSection() {
  const t = useTranslations("common");
  const [phase, setPhase] = useState<Phase>("panel");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const advancePhase = useCallback(() => {
    setPhase((prev) => {
      const idx = PHASE_ORDER.indexOf(prev);
      return PHASE_ORDER[(idx + 1) % PHASE_ORDER.length] as Phase;
    });
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(advancePhase, PHASE_DURATIONS[phase]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, advancePhase]);

  return (
    <section className="relative overflow-hidden bg-primary-palest py-16 md:py-24">
      {/* Background decorations */}
      {/* Top-right quarter circle */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary-lighter/30" />
      {/* Left large half circle */}
      <div className="pointer-events-none absolute -left-24 top-1/3 size-80 rounded-full bg-primary-lightest/50" />
      {/* Bottom-right circle */}
      <div className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-primary-pale/60" />
      {/* Starburst - top left */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-8 top-12 size-16 text-white md:left-16 md:top-16 md:size-20"
        viewBox="0 0 80 80"
      >
        <polygon
          points="40,0 46,30 80,30 52,48 60,80 40,58 20,80 28,48 0,30 34,30"
          fill="currentColor"
        />
      </svg>
      {/* Green hill - top left */}
      <div className="pointer-events-none absolute left-0 top-20 h-20 w-40 rounded-tr-full bg-primary-base/20 md:top-28 md:h-24 md:w-52" />

      <div className="container relative z-10 mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-[1.75rem] font-bold text-primary-darker md:text-3xl">
            {t("landing_footprint_title")}
          </h2>
          <p className="mt-2 text-sm text-basic-400">{t("landing_footprint_subtitle_1")}</p>
          <p className="text-sm text-basic-400">{t("landing_footprint_subtitle_2")}</p>
        </div>

        {/* Animation Container */}
        <div className="relative mx-auto h-[420px] w-full max-w-sm md:h-[460px]">
          <AnimatePresence mode="wait">
            {phase === "panel" && (
              <motion.div
                key="checkin"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                }}
              >
                <CheckInPanel t={t} />
              </motion.div>
            )}

            {phase === "journal" && (
              <motion.div
                key="journal"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Background color block - enters diagonally */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ x: -60, y: 60, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="h-[380px] w-[320px] rotate-[-4deg] rounded-2xl bg-primary-lighter/40 md:h-[420px] md:w-[350px]" />
                </motion.div>

                {/* Front journal paper - enters diagonally with slight delay */}
                <motion.div
                  className="relative"
                  initial={{ x: -40, y: 40, opacity: 0, rotate: -6 }}
                  animate={{ x: 0, y: 0, opacity: 1, rotate: 2 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15,
                    ease: "easeOut",
                  }}
                >
                  <JournalPaper />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
