"use client";

import { useAuth } from "@daodao/auth";
import { ANCHOR_IDS } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { motion } from "motion/react";

const FEATURE_CARDS = [
  {
    title: "目標探索",
    description: "在實踐中 釐清動機與目標",
    bgColor: "bg-[#E3F2FD]",
    textColor: "text-primary-darker",
  },
  {
    title: "資源推薦",
    description: "龐大資源庫 支援你的學習",
    bgColor: "bg-[#E8F5E9]",
    textColor: "text-primary-darker",
  },
  {
    title: "紀錄成長",
    description: "所有足跡 一目瞭然",
    bgColor: "bg-[#FFF8E1]",
    textColor: "text-primary-darker",
  },
  {
    title: "同儕推進",
    description: "找到志趣相同的夥伴 共同成長",
    bgColor: "bg-white",
    textColor: "text-primary-darker",
    badge: "即將推出",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function JoinSection() {
  const { openLoginDialog } = useAuth();

  return (
    <section
      className="relative overflow-hidden bg-primary-base py-16 md:py-24"
      id={ANCHOR_IDS.PLANS}
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            {/* Compass icon placeholder - use existing dashboard compass */}
            <div className="flex size-8 items-center justify-center rounded-full bg-tips">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
          </div>
          <h2 className="text-[1.75rem] font-bold text-white">加入島島阿學</h2>
          <p className="mt-2 text-sm text-white/80">
            成為 Beta 使用者，與我們一起打造更好的學習體驗
          </p>
        </div>

        {/* 2x2 Feature Cards Grid */}
        <motion.div
          className="mx-auto mb-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          {FEATURE_CARDS.map((card) => (
            <motion.div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl ${card.bgColor} p-6`}
              variants={cardVariants}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {card.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-tips px-2.5 py-0.5 text-[10px] font-medium text-white">
                  {card.badge}
                </span>
              )}
              <h3 className={`text-lg font-bold ${card.textColor}`}>
                {card.title}
              </h3>
              <p className="mt-1 text-sm text-basic-400">{card.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="flex flex-col items-center">
          <Button
            variant="ctaOrange"
            size="huge"
            onClick={() => openLoginDialog({ redirectUrl: "/" })}
          >
            立即免費註冊
          </Button>
          <p className="mt-3 text-center text-[13px] text-white/70">
            Beta 期間完全免費 · 無需信用卡
          </p>
        </div>
      </div>
    </section>
  );
}
