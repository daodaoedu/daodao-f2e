"use client";

import {
  BoredSvg,
  FineSvg,
  FrustratedSvg,
  HappySvg,
  HopelessSvg,
  NeutralSvg,
} from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { AnimatePresence, motion } from "motion/react";
import { type ElementType, useEffect, useState } from "react";

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

// Animation timing (in seconds)
const STEP_PANEL_SHOW = 3;
const STEP_JOURNAL_SHOW = 3.5;

function CheckInPanel({ t }: { t: (key: string) => string }) {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
      <h3 className="mb-4 text-lg font-bold text-primary-darker">
        自己準備便當
      </h3>

      {/* Emotion selector */}
      <p className="mb-3 text-sm font-medium text-basic-400">
        {t("landing_footprint_mood_label")}
      </p>
      <div className="mb-5 flex justify-between gap-2">
        {EMOTIONS.map((emotion) => (
          <div
            key={emotion.key}
            className={`flex flex-col items-center gap-1 rounded-lg p-1.5 ${
              emotion.key === "happy"
                ? "bg-primary-palest ring-2 ring-primary-base"
                : ""
            }`}
          >
            <emotion.Icon className="size-8" />
            <span className="text-[10px] text-basic-400">
              {t(emotion.labelKey)}
            </span>
          </div>
        ))}
      </div>

      {/* Thought tags */}
      <p className="mb-2 text-sm font-medium text-basic-400">
        {t("landing_footprint_thoughts_label")}
      </p>
      <div className="mb-5 flex flex-wrap gap-2">
        {THOUGHT_TAGS.map((tag) => (
          <span
            key={tag}
            className={`rounded-full px-3 py-1 text-xs ${
              SELECTED_TAGS.includes(tag)
                ? "bg-primary-base text-white"
                : "bg-basic-100 text-basic-400"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="mb-1 text-sm font-medium text-basic-400">
        {t("landing_footprint_description_label")}{" "}
        <span className="text-basic-300">0/300</span>
      </p>
      <div className="rounded-lg bg-basic-100 p-3 text-sm text-basic-400">
        挑戰完成了超美麗的日式便當，天啊太有成就感了吧！！下次要再開發一些新菜色～
      </div>
    </div>
  );
}

function JournalPaper() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#FFFDF5] shadow-lg">
      {/* Notebook holes */}
      <div className="flex justify-center gap-6 border-b border-basic-200 py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="size-3 rounded-full border-2 border-basic-300 bg-white"
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative p-5">
        {/* Lined paper effect */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 27px, #e5e7eb 28px)",
          }}
        />

        <div className="relative">
          {/* Emotion + date */}
          <div className="mb-3 flex items-center gap-2">
            <NeutralSvg className="size-6" />
            <span className="text-xs text-basic-400">普通</span>
          </div>

          {/* Journal text */}
          <p className="mb-4 text-sm leading-7 text-basic-400">
            今天嘗試做了簡單的三明治便當，雖然賣相普通但味道還不錯。下次想挑戰日式便當！
          </p>

          {/* Tags */}
          <div className="mb-4 flex gap-2">
            <span className="text-xs text-primary-base">#有趣</span>
            <span className="text-xs text-primary-base">#下一步</span>
          </div>

          {/* Stamp */}
          <div className="absolute -right-1 top-0 flex size-16 rotate-[-15deg] items-center justify-center rounded-full border-2 border-dashed border-tips text-center">
            <div className="text-[8px] font-bold leading-tight text-tips">
              Practice
              <br />
              Checked In
              <br />
              2026/01/01
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FootprintSection() {
  const t = useTranslations("common");
  const [showPanel, setShowPanel] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(
      () => setShowPanel((prev) => !prev),
      (showPanel ? STEP_PANEL_SHOW : STEP_JOURNAL_SHOW) * 1000
    );
    return () => clearTimeout(timeout);
  }, [showPanel]);

  return (
    <section className="relative overflow-hidden bg-primary-darker py-16 md:py-24">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-[1.75rem] font-bold text-white">
            {t("landing_footprint_title")}
          </h2>
          <p className="mt-2 text-sm text-white/70">
            {t("landing_footprint_subtitle_1")}
          </p>
          <p className="text-sm text-white/70">
            {t("landing_footprint_subtitle_2")}
          </p>
        </div>

        {/* Animation Container */}
        <div className="relative mx-auto h-[400px] w-full max-w-sm md:h-[440px]">
          <AnimatePresence mode="wait">
            {showPanel ? (
              <motion.div
                key="checkin"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <CheckInPanel t={t} />
              </motion.div>
            ) : (
              <motion.div
                key="journal"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ y: 40, opacity: 0, rotate: 3 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <JournalPaper />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Background decorations */}
      <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-base/20" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 translate-x-1/3 translate-y-1/3 rounded-full bg-primary-base/20" />
    </section>
  );
}
