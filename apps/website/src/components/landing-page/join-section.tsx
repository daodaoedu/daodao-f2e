"use client";

import { CompassSvg } from "@daodao/assets";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { ANCHOR_IDS } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";

interface FeatureCardProps {
  title: string;
  description: string;
  bgColor: string;
  badge?: string;
  className?: string;
}

function FeatureCard({ title, description, bgColor, badge, className = "" }: FeatureCardProps) {
  return (
    <div
      className={`relative h-[160px] w-[150px] overflow-hidden rounded-[9px] px-4 py-6 md:h-[181px] md:w-[205px] md:px-[18px] md:py-[37px] ${bgColor} ${className}`}
    >
      {badge && (
        <div className="absolute -left-8 top-4 -rotate-45 bg-tips px-10 py-1 text-[10px] font-medium text-white">
          {badge}
        </div>
      )}
      <div className={badge ? "mt-4" : ""}>
        <h3 className="text-base font-bold text-primary-darker md:text-lg">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-basic-400 md:mt-2 md:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

export function JoinSection() {
  const { openLoginDialog } = useAuth();
  const t = useTranslations("common");

  return (
    <section
      className="relative overflow-hidden bg-primary-base py-16 md:py-24"
      id={ANCHOR_IDS.PLANS}
    >
      {/* 右上角十字星裝飾 */}
      <div className="absolute right-8 top-8 text-3xl text-primary-lighter md:right-16 md:top-12">
        ✦
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-center lg:gap-16">
          {/* 左側：功能卡片區 */}
          <div className="relative grid grid-cols-2 gap-2 md:gap-3">
            {/* 指南針裝飾 - 在目標探索卡片左上角 */}
            <div className="absolute -left-2 -top-4 z-10 md:-left-6 md:-top-2">
              <CompassSvg className="size-12 md:size-20" />
            </div>

            {/* 目標探索 - 左上 */}
            <FeatureCard
              title={t("landing_join_goal")}
              description={t("landing_join_goal_desc")}
              bgColor="bg-[#D4F1F4]"
              className="mt-6 md:mt-8"
            />

            {/* 紀錄成長 - 右上（下移） */}
            <FeatureCard
              title={t("landing_join_growth")}
              description={t("landing_join_growth_desc")}
              bgColor="bg-[#FFE66D]"
              className="mt-12 md:mt-16"
            />

            {/* 資源推薦 - 左下 */}
            <FeatureCard
              title={t("landing_join_resource")}
              description={t("landing_join_resource_desc")}
              bgColor="bg-[#D4F1F4]"
            />

            {/* 同儕推進 - 右下（有標籤） */}
            <FeatureCard
              title={t("landing_join_peer")}
              description={t("landing_join_peer_desc")}
              bgColor="bg-white"
              badge={t("landing_join_coming_soon")}
              className="mt-6 md:mt-8"
            />
          </div>

          {/* 右側：CTA 區 */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h2 className="text-[1.75rem] font-bold text-white md:text-3xl">
              {t("landing_join_title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80 md:text-base">
              成為 Beta 使用者
              <br />
              與我們一起打造更好的學習體驗
            </p>

            <Button
              variant="ctaOrange"
              size="huge"
              className="mt-8"
              onClick={() => openLoginDialog({ redirectUrl: "/" })}
            >
              {t("landing_join_cta")}
            </Button>

            <p className="mt-3 text-[13px] text-white/70">{t("landing_join_cta_note")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
