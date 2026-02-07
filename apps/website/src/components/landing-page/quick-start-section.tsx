"use client";

import { BulbSvg, ClockSolidSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { motion } from "motion/react";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

export function QuickStartSection() {
  const t = useTranslations("common");

  const stats = [
    { label: t("landing_quickstart_total_duration"), value: "14", unit: "天" },
    { label: t("landing_quickstart_weekly_freq"), value: "3-5", unit: "天" },
    { label: t("landing_quickstart_per_session"), value: "30", unit: "分鐘" },
  ];

  const timeSlots = [
    t("landing_quickstart_before_breakfast"),
    t("landing_quickstart_commute"),
    t("landing_quickstart_before_bed"),
  ];

  return (
    <section className="relative overflow-hidden bg-primary-base py-16 md:py-24">
      {/* Top curve */}
      <div
        className="absolute -top-1 left-0 z-10 w-full bg-cover bg-center bg-no-repeat md:bg-top"
        style={{
          backgroundImage: 'url("/assets/landing-page/bg-curve-green.svg")',
          height: "120px",
        }}
      />

      <div className="container mx-auto px-6 pt-16">
        <motion.div
          className="flex flex-col items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.4 }}
        >
          {/* Step 0: Section Header */}
          <motion.h2
            className="mb-12 text-center text-[1.75rem] font-bold text-white"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            {t("landing_quickstart_title")}
          </motion.h2>

          {/* Steps 1-3: Stats Cards (staggered as a group) */}
          <motion.div
            className="mb-10 flex w-full max-w-lg flex-col gap-4 md:flex-row md:gap-6"
            variants={staggerContainer}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                className="flex flex-1 flex-col items-center rounded-2xl bg-white/15 px-6 py-5 backdrop-blur-sm"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                <span className="text-sm text-white/80">{stat.label}</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {stat.value}
                  </span>
                  <span className="text-sm text-white/80">{stat.unit}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Step 4: Execution Time */}
          <motion.div
            className="mb-10 flex flex-col items-center gap-4"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <BulbSvg className="size-5 text-white" />
              <span className="font-semibold text-white">
                {t("landing_quickstart_timing")}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {timeSlots.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white backdrop-blur-sm"
                >
                  <ClockSolidSvg className="size-4 text-white/80" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Step 5: Bottom message */}
          <motion.p
            className="text-center text-sm text-white/80"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            {t("landing_quickstart_message")}
          </motion.p>
        </motion.div>
      </div>

      {/* Illustration placeholders */}
      <div className="pointer-events-none absolute bottom-8 left-8 hidden opacity-30 md:block">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-tips/40 text-4xl">
          {/* TODO: Replace with star-on-paper-airplane illustration */}
          ⭐
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-8 right-8 hidden opacity-30 md:block">
        <BulbSvg className="size-12 text-white/40" />
      </div>
    </section>
  );
}
