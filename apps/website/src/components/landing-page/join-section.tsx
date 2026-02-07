"use client";

import { CompassSvg } from "@daodao/assets";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { ANCHOR_IDS } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { motion } from "motion/react";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function JoinSection() {
  const { openLoginDialog } = useAuth();
  const t = useTranslations("common");

  const featureCards = [
    {
      title: t("landing_join_goal"),
      description: t("landing_join_goal_desc"),
      bgColor: "bg-[#E3F2FD]",
    },
    {
      title: t("landing_join_resource"),
      description: t("landing_join_resource_desc"),
      bgColor: "bg-[#E8F5E9]",
    },
    {
      title: t("landing_join_growth"),
      description: t("landing_join_growth_desc"),
      bgColor: "bg-[#FFF8E1]",
    },
    {
      title: t("landing_join_peer"),
      description: t("landing_join_peer_desc"),
      bgColor: "bg-white",
      badge: t("landing_join_coming_soon"),
    },
  ];

  return (
    <section
      className="relative overflow-hidden bg-primary-base py-16 md:py-24"
      id={ANCHOR_IDS.PLANS}
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <CompassSvg className="size-8" />
          </div>
          <h2 className="text-[1.75rem] font-bold text-white">
            {t("landing_join_title")}
          </h2>
          <p className="mt-2 text-sm text-white/80">
            {t("landing_join_subtitle")}
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
          {featureCards.map((card) => (
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
              <h3 className="text-lg font-bold text-primary-darker">
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
            {t("landing_join_cta")}
          </Button>
          <p className="mt-3 text-center text-[13px] text-white/70">
            {t("landing_join_cta_note")}
          </p>
        </div>
      </div>
    </section>
  );
}
