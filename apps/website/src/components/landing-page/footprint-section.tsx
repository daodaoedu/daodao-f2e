"use client";

import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Animation timing (ms) per design spec:
 * 1. animation-1: 卡片往上進場 + 往下退場 = 2s
 * 2. 空白 = 1s
 * 3. animation-2: 背後色塊往斜上角度進場 = 0.5s
 * 4. animation-2 + animation-3: 色塊 + 前面卡片疊加維持 = 3s
 * 重複循環
 */
type AnimationPhase = "card" | "blank" | "block" | "block-card";

const PHASE_CONFIG: Record<AnimationPhase, { duration: number }> = {
  card: { duration: 2000 },
  blank: { duration: 1000 },
  block: { duration: 500 },
  "block-card": { duration: 3000 },
};

const PHASE_ORDER: AnimationPhase[] = ["card", "blank", "block", "block-card"];

export function FootprintSection() {
  const t = useTranslations("common");
  const tLanding = useTranslations("landing_page");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const phase = PHASE_ORDER[phaseIndex] ?? "card";

  const advancePhase = useCallback(() => {
    setPhaseIndex((prev) => (prev + 1) % PHASE_ORDER.length);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(advancePhase, PHASE_CONFIG[phase].duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, advancePhase]);

  return (
    <section className="relative overflow-hidden pt-16 md:pt-24">
      {/* Background SVG - responsive */}
      <Image
        src="/assets/landing-page/bg-mobile.svg"
        alt=""
        fill
        className="object-cover md:hidden"
        priority
      />
      <Image
        src="/assets/landing-page/bg-desktop.svg"
        alt=""
        fill
        className="hidden object-cover md:block"
        priority
      />

      <div className="container relative z-10 mx-auto px-6">
        {/* Header */}
        <div className="mb-4 text-center">
          <h2 className="text-[1.75rem] font-bold text-primary-darker md:text-3xl">
            {t("landing_footprint_title")}
          </h2>
          <p className="mt-2 text-sm text-basic-400">{t("landing_footprint_subtitle_1")}</p>
          <p className="text-sm text-basic-400">{t("landing_footprint_subtitle_2")}</p>
        </div>

        {/* Animation Container */}
        <div className="relative mx-auto h-[380px] w-full md:h-[440px]">
          {/* 階段 1+2：卡片進退場 */}
          <AnimatePresence>
            {phase === "card" && (
              <motion.div
                key="card"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/assets/landing-page/animation-1.svg"
                  alt={tLanding("footprint_animation_card_alt")}
                  fill
                  className="object-contain object-bottom"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 階段 3+4：色塊進場後保持 */}
          <AnimatePresence>
            {(phase === "block" || phase === "block-card") && (
              <motion.div
                key="block-layer"
                className="absolute inset-0"
                initial={{ x: -60, y: 60, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Image
                  src="/assets/landing-page/animation-2.svg"
                  alt={tLanding("footprint_animation_block_alt")}
                  fill
                  className="object-contain object-bottom"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 階段 4：前面卡片從右下滑到左上疊加 */}
          <AnimatePresence>
            {phase === "block-card" && (
              <motion.div
                key="card-layer"
                className="absolute inset-0"
                initial={{ x: 40, y: 40, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <Image
                  src="/assets/landing-page/animation-3.svg"
                  alt={tLanding("footprint_animation_card_overlay_alt")}
                  fill
                  className="object-contain object-bottom"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
