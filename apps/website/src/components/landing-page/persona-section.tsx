"use client";

import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";
import { SectionHeader } from "@daodao/ui/components/section-header";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

interface PersonaCard {
  name: string;
  avatar: string;
  professionKey: string;
  explorationKey: string;
  quote: string;
}

// Desktop layout positions: left, top-center, right
const DESKTOP_POSITIONS = [
  "left-0 top-1/2 -translate-y-1/2",
  "left-1/2 top-0 -translate-x-1/2",
  "right-0 top-1/2 -translate-y-1/2",
];

// 3 positions × 2-3 cards each
const PERSONA_POSITIONS: PersonaCard[][] = [
  // Left position - Mia's cards
  [
    {
      name: "Mia",
      avatar: "/assets/landing-page/avatar-girl.svg",
      professionKey: "內容創作",
      explorationKey: "影片剪輯與後製",
      quote: "每個故事都值得被好好說出來，讓世界看見不同的聲音",
    },
    {
      name: "Mia",
      avatar: "/assets/landing-page/avatar-girl.svg",
      professionKey: "前端開發",
      explorationKey: "心理學",
      quote: "最近開始對設計心理學有興趣，覺得研究人在想什麼很好玩",
    },
  ],
  // Top-center position - Emma's cards
  [
    {
      name: "Emma",
      avatar: "/assets/landing-page/avatar-girl.svg",
      professionKey: "潛水教練",
      explorationKey: "閱讀、商管與理財",
      quote: "深深著迷於海底的世界，希望能認識更多上山下海愛好者 ❤️",
    },
  ],
  // Right position - Sophia's cards
  [
    {
      name: "Sophia",
      avatar: "/assets/landing-page/avatar-boy.svg",
      professionKey: "數據分析",
      explorationKey: "攝影、視覺設計",
      quote: "用數據說故事，用鏡頭記錄生活的美好瞬間",
    },
    {
      name: "Sophie",
      avatar: "/assets/landing-page/avatar-boy.svg",
      professionKey: "產品設計",
      explorationKey: "用戶體驗研究",
      quote: "設計不只是美，更是解決問題的藝術",
    },
  ],
];

// Flattened for mobile single-card carousel
const ALL_PERSONA_CARDS = PERSONA_POSITIONS.flat();

function PersonaCardComponent({
  card,
  professionLabel,
  explorationLabel,
}: {
  card: PersonaCard;
  professionLabel: string;
  explorationLabel: string;
}) {
  return (
    <div className="w-[260px] rounded-2xl border-2 border-primary-base bg-white p-5 shadow-md md:w-[280px]">
      {/* Avatar + Name */}
      <div className="mb-3 flex items-center gap-3">
        <div className="size-10 overflow-hidden rounded-full bg-primary-palest">
          <Image
            src={card.avatar}
            alt={card.name}
            width={40}
            height={40}
          />
        </div>
        <span className="font-bold text-primary-base">{card.name}</span>
      </div>

      {/* Info rows */}
      <div className="mb-3 space-y-1.5 border-b border-dashed border-basic-200 pb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-basic-300">{professionLabel}</span>
          <span className="text-basic-400">{card.professionKey}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-basic-300">{explorationLabel}</span>
          <span className="text-basic-400">{card.explorationKey}</span>
        </div>
      </div>

      {/* Quote */}
      <div className="rounded-lg bg-mascot-bright-blue/20 p-3">
        <p className="text-sm leading-relaxed text-basic-400">
          &ldquo;{card.quote}&rdquo;
        </p>
      </div>

      {/* Speech bubble tail */}
      <div className="relative">
        <div className="absolute -bottom-3 left-6 h-3 w-4 overflow-hidden">
          <div className="absolute -top-2 h-4 w-4 rotate-45 border-b-2 border-r-2 border-primary-base bg-white" />
        </div>
      </div>
    </div>
  );
}

// Desktop: 3 positions with rotating cards
function DesktopPersonaCarousel({
  professionLabel,
  explorationLabel,
}: {
  professionLabel: string;
  explorationLabel: string;
}) {
  const [indices, setIndices] = useState([0, 0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  const rotateCards = useCallback(() => {
    setIndices((prev) =>
      prev.map((idx, posIdx) => {
        const cards = PERSONA_POSITIONS[posIdx];
        if (!cards || cards.length <= 1) return idx;
        return (idx + 1) % cards.length;
      })
    );
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(rotateCards, 4000);
    return () => clearInterval(interval);
  }, [rotateCards, isPaused]);

  return (
    <div
      className="relative mx-auto hidden h-[400px] max-w-4xl md:block"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {PERSONA_POSITIONS.map((cards, posIdx) => {
        const cardIndex = indices[posIdx] ?? 0;
        const card = cards[cardIndex];
        if (!card) return null;

        return (
          <div key={posIdx} className={`absolute ${DESKTOP_POSITIONS[posIdx]}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${posIdx}-${cardIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <PersonaCardComponent
                  card={card}
                  professionLabel={professionLabel}
                  explorationLabel={explorationLabel}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// Mobile: single card carousel
function MobilePersonaCarousel({
  professionLabel,
  explorationLabel,
}: {
  professionLabel: string;
  explorationLabel: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ALL_PERSONA_CARDS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentCard = ALL_PERSONA_CARDS[currentIndex];
  if (!currentCard) return null;

  return (
    <div
      className="flex flex-col items-center md:hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.35 }}
        >
          <PersonaCardComponent
            card={currentCard}
            professionLabel={professionLabel}
            explorationLabel={explorationLabel}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      <div className="mt-6 flex gap-2">
        {ALL_PERSONA_CARDS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`查看第 ${idx + 1} 張卡片`}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex ? "w-6 bg-primary-base" : "w-2 bg-basic-200"
            }`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export function PersonaSection() {
  const t = useTranslations("common");

  return (
    <section className="relative overflow-hidden bg-primary-palest px-6 py-16 text-basic-400 md:py-20">
      {/* Slogan text */}
      <SectionHeader
        title={t("landing_persona_title")}
        subtitle={t("landing_persona_subtitle")}
        variant="dark"
        alignment="center"
        titleClassName="text-primary-darker text-[22px] whitespace-pre-line"
        subtitleClassName="text-basic-400 italic"
      />

      {/* Persona Cards */}
      <DesktopPersonaCarousel
        professionLabel={t("landing_persona_profession")}
        explorationLabel={t("landing_persona_exploration")}
      />
      <MobilePersonaCarousel
        professionLabel={t("landing_persona_profession")}
        explorationLabel={t("landing_persona_exploration")}
      />

      {/* Bottom decorative semicircles */}
      <div className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2">
        <div className="h-32 w-64 rounded-t-full bg-primary-base/10" />
      </div>
    </section>
  );
}
