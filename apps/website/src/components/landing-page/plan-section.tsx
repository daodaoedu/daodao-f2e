"use client";

import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";

export function PlanSection() {
  const { openLoginDialog } = useAuth();
  const t = useTranslations("landing_page");
  return (
    <section
      className="relative mt-[60px] flex flex-col items-center justify-center overflow-x-clip pb-[60px]"
      id="plans"
    >
      {/* Section Header */}
      <div className="px-6 pb-[60px] text-center text-primary-darker">
        <h2 className="mb-2 text-[28px] font-semibold">{t("plan_section_title")}</h2>
        <h3 className="text-sm">{t("plan_section_subtitle")}</h3>
      </div>

      <div className="container mx-auto">
        <div className="flex w-full flex-col items-center justify-center py-8 md:flex-row md:gap-6">
          {/* 外層容器 - 用於定位裝飾元素 */}
          <div className="relative">
            {/* 裝飾元素 - 半圓 */}
            <Image
              src="/assets/landing-page/deco-semicircle.svg"
              alt={t("plan_deco_semicircle_alt")}
              width={127}
              height={84}
              className="absolute -left-16 -top-10 z-0"
            />

            {/* 內容區塊 */}
            <div className="relative z-10 flex max-w-[400px] flex-col items-center justify-center rounded-[20px] border-2 border-primary-base bg-primary-palest p-6 text-primary-darker">
              <h2 className="text-center text-lg font-semibold">{t("plan_card_title")}</h2>
              <p className="mb-6 mt-2 text-center text-[13px]">
                {t("plan_card_desc")}
              </p>

              <ul className="mb-3 w-full list-none p-0">
                <li className="text-primary-500 relative border-b border-gray-200 py-2 pl-10 before:absolute before:left-0 before:top-2 before:size-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-contain before:bg-center before:bg-no-repeat">
                  {t("plan_feature_1")}
                </li>
                <li className="text-primary-500 relative border-b border-gray-200 py-2 pl-10 before:absolute before:left-0 before:top-2 before:size-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-contain before:bg-center before:bg-no-repeat">
                  {t("plan_feature_2")}
                </li>
                <li className="text-primary-500 relative border-b border-gray-200 py-2 pl-10 before:absolute before:left-0 before:top-2 before:size-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-contain before:bg-center before:bg-no-repeat">
                  {t("plan_feature_3")}
                </li>
                <li className="text-primary-500 relative border-b border-gray-200 py-2 pl-10 before:absolute before:left-0 before:top-2 before:size-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-contain before:bg-center before:bg-no-repeat">
                  {t("plan_feature_4")}
                </li>
                <li className="text-primary-500 relative py-2 pl-10 before:absolute before:left-0 before:top-2 before:size-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-contain before:bg-center before:bg-no-repeat">
                  {t("plan_feature_5")}
                </li>
              </ul>

              <Button
                variant="ctaOrange"
                size="huge"
                className="mt-6"
                onClick={() => openLoginDialog({ redirectUrl: "/" })}
              >
                {t("plan_cta_button")}
              </Button>
              <p className="mt-2 text-center text-[13px]">{t("plan_cta_note")}</p>
            </div>

            {/* 裝飾元素 - 幾何圖形 */}
            <Image
              src="/assets/landing-page/deco-geometries.svg"
              alt={t("plan_deco_geometries_alt")}
              width={107}
              height={91}
              className="absolute -right-8 bottom-[-44px] z-20"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
