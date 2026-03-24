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

// Desktop layout positions matching design: A (left), B (top-center-right), C (right)
const DESKTOP_POSITIONS = [
  "left-0 top-[35%]", // Position A - 左側
  "left-[55%] -translate-x-1/2 top-0", // Position B - 上方偏右
  "right-0 top-[45%]", // Position C - 右側
];

// 3 positions × 3 cards each (based on CSV data: A, B, C positions)
const PERSONA_POSITIONS: PersonaCard[][] = [
  // Position A (左側) - Mia, Emma, Sophia
  [
    {
      name: "Mia",
      avatar: "/assets/landing-page/avatar-girl.svg",
      professionKey: "內容創作",
      explorationKey: "影片剪輯與後製",
      quote: "每個故事都值得被好好說出來，讓世界看見不同的聲音",
    },
    {
      name: "Emma",
      avatar: "/assets/landing-page/avatar-girl.svg",
      professionKey: "潛水教練",
      explorationKey: "閱讀、商管與理財",
      quote: "深深著迷於海底的世界，希望能認識更多上山下海愛好者 ❤️",
    },
    {
      name: "Sophia",
      avatar: "/assets/landing-page/avatar-girl.svg",
      professionKey: "數據分析",
      explorationKey: "攝影、視覺設計",
      quote: "用數據說故事，用鏡頭記錄生活的美好瞬間",
    },
  ],
  // Position B (上方偏右) - Ryan, Lily, Kevin
  [
    {
      name: "Ryan",
      avatar: "/assets/landing-page/avatar-boy.svg",
      professionKey: "軟體工程師",
      explorationKey: "跨領域學習、身心探索",
      quote: "下班後的我只想切換頻道，學習如果能夠像玩遊戲一樣就太好了",
    },
    {
      name: "Lily",
      avatar: "/assets/landing-page/avatar-girl.svg",
      professionKey: "行銷企劃",
      explorationKey: "插畫、內容寫作",
      quote: "總是有很多靈感閃過，但沒記下來就忘了。想練習好好保留每個創作的想法！！",
    },
    {
      name: "Kevin",
      avatar: "/assets/landing-page/avatar-boy.svg",
      professionKey: "高中老師",
      explorationKey: "教育議題、Podcast",
      quote: "教學之外，我也想多花一點時間探索自己、書寫自己",
    },
  ],
  // Position C (右側) - Zoe, Allen, Yuki
  [
    {
      name: "Zoe",
      avatar: "/assets/landing-page/avatar-girl.svg",
      professionKey: "設計接案者",
      explorationKey: "烹飪、日記書寫",
      quote: "想在生活的忙碌縫隙中，留下一點時間給自己，慢慢重拾創造的感覺。",
    },
    {
      name: "Allen",
      avatar: "/assets/landing-page/avatar-boy.svg",
      professionKey: "新創營運經理",
      explorationKey: "行動研究、斜槓人生設計",
      quote: "很想嘗試一個月挑戰，看看自己在專注做一件事時，能長出什麼樣的成果 🙌",
    },
    {
      name: "Yuki",
      avatar: "/assets/landing-page/avatar-girl.svg",
      professionKey: "研究所學生",
      explorationKey: "社會議題、手寫筆記",
      quote: "有時候學習讓我很焦慮，但我想試試看用更溫柔的方式陪自己走過探索的路。",
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
    <div className="relative w-[300px]">
      {/* Avatar - 突出在卡片左上角 */}
      <div className="absolute -top-8 left-4 z-10 size-16 overflow-hidden rounded-full border-2 border-basic-200 bg-white">
        <Image src={card.avatar} alt={card.name} width={64} height={64} className="object-cover" />
      </div>

      {/* Card body */}
      <div className="relative rounded-[16px] border border-primary-base bg-white px-5 pb-4 pt-10">
        {/* Name - 在頭像右邊 */}
        <div className="absolute left-[88px] top-3">
          <span className="text-xl font-bold text-primary-base">{card.name}</span>
        </div>

        {/* Info rows */}
        <div className="mb-3 mt-2 space-y-1">
          <div className="flex items-baseline gap-4">
            <span className="w-16 shrink-0 text-sm text-basic-300">{professionLabel}</span>
            <span className="text-base font-medium text-basic-500">{card.professionKey}</span>
          </div>
          <div className="flex items-baseline gap-4 border-b border-dashed border-basic-200 pb-3">
            <span className="w-16 shrink-0 text-sm text-basic-300">{explorationLabel}</span>
            <span className="text-base font-medium text-basic-500">{card.explorationKey}</span>
          </div>
        </div>

        {/* Quote - 對話框樣式 */}
        <div className="relative rounded-lg bg-primary-palest px-4 py-3">
          <p className="text-sm leading-relaxed text-basic-500">{card.quote}</p>
          {/* 對話框小三角 */}
          <div className="absolute -top-2 left-6 size-0 border-x-8 border-b-8 border-x-transparent border-b-primary-palest" />
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
    // biome-ignore lint/a11y/noStaticElementInteractions: carousel pause on hover
    <div
      className="absolute inset-0"
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
          // biome-ignore lint/suspicious/noArrayIndexKey: static position array
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
    // biome-ignore lint/a11y/noStaticElementInteractions: carousel pause on hover
    <section
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
    </section>
  );
}

export function PersonaSection() {
  const t = useTranslations("common");

  return (
    <section className="relative overflow-hidden bg-primary-palest px-6 py-16 text-basic-400 md:py-20">
      {/* Background - desktop only */}
      <Image
        src="/assets/landing-page/islands.svg"
        alt=""
        fill
        className="hidden object-cover md:block"
      />

      {/* Desktop: 卡片 + 中間小島文字 */}
      <div className="relative z-10 mx-auto hidden max-w-5xl md:block">
        <div className="relative h-[600px]">
          {/* 中間：小島圖片 + 文字 */}
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
            <Image
              src="/assets/landing-page/island.svg"
              alt="學習小島"
              width={280}
              height={50}
              className="mx-auto mb-4"
            />
            <h2 className="text-xl font-bold leading-relaxed text-primary-darker">
              每個人都有自己的學習小島，
              <br />
              透過交流與分享，連結成群島
            </h2>
            <p className="mt-2 text-sm italic text-basic-400">
              Where personal growth meets collective wisdom!
            </p>
          </div>

          {/* 桌機版卡片輪播 */}
          <DesktopPersonaCarousel
            professionLabel={t("landing_persona_profession")}
            explorationLabel={t("landing_persona_exploration")}
          />
        </div>
      </div>

      {/* Mobile */}
      <div className="relative z-10 md:hidden">
        <SectionHeader
          title={t("landing_persona_title")}
          subtitle={t("landing_persona_subtitle")}
          variant="dark"
          alignment="center"
          titleClassName="text-primary-darker text-[22px] whitespace-pre-line"
          subtitleClassName="text-basic-400 italic"
        />
        <MobilePersonaCarousel
          professionLabel={t("landing_persona_profession")}
          explorationLabel={t("landing_persona_exploration")}
        />
        {/* Island decoration */}
        <div className="mt-6 flex justify-center">
          <Image src="/assets/landing-page/island-mobile.svg" alt="" width={236} height={48} />
        </div>
      </div>
    </section>
  );
}
