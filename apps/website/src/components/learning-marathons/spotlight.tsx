"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";

// 定義類型
type SpotlightFeature = {
  id: string;
  text: string;
};

type SpotlightItem = {
  id: string;
  title: string;
  description: string;
  backgroundColor: string;
  features: SpotlightFeature[];
  hasBackgroundImage?: boolean;
};

// 特色卡片組件
const SpotlightCard = ({ spotlight }: { spotlight: SpotlightItem }) => {
  const backgroundImageClasses = spotlight.hasBackgroundImage
    ? "after:absolute after:bottom-[-22px] after:right-[-70px] after:block after:h-[140px] after:w-[185px] after:bg-cover after:bg-no-repeat after:content-[''] after:bg-[url('/assets/learning-marathon/booming.png')] max-lg:after:hidden"
    : "";

  const cardClasses = cn(
    "relative p-6 rounded-[10px]",
    spotlight.backgroundColor,
    backgroundImageClasses
  );

  return (
    <div className={cardClasses}>
      <h3 className="mb-8 text-lg font-bold leading-[140%] text-white">{spotlight.title}</h3>
      <p className="text-sm font-normal leading-[140%] text-white">{spotlight.description}</p>
      {spotlight.id === "ai-community" && <br />}
      <div className="mt-4">
        <ul className="list-disc pl-4">
          {spotlight.features.map((feature) => (
            <li
              key={feature.id}
              className="text-left text-sm font-normal leading-[140%] text-white"
            >
              {feature.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * 學習馬拉松特色展示組件
 */
export const Spotlight = () => {
  const t = useTranslations("learning_marathon");

  const spotlightItems: SpotlightItem[] = [
    {
      id: "professional-coaching",
      title: t("spotlight_coaching_title"),
      description: t("spotlight_coaching_desc"),
      backgroundColor: "bg-[#1F4645]",
      hasBackgroundImage: false,
      features: [
        { id: "experience-extraction", text: t("spotlight_coaching_feature_1") },
        { id: "goddard-college", text: t("spotlight_coaching_feature_2") },
        { id: "learning-journeys", text: t("spotlight_coaching_feature_3") },
        { id: "ai-guidance", text: t("spotlight_coaching_feature_4") },
      ],
    },
    {
      id: "ai-community",
      title: t("spotlight_ai_community_title"),
      description: t("spotlight_ai_community_desc"),
      backgroundColor: "bg-primary-base",
      hasBackgroundImage: true,
      features: [
        { id: "ai-recommendation", text: t("spotlight_ai_community_feature_1") },
        { id: "diverse-community", text: t("spotlight_ai_community_feature_2") },
      ],
    },
  ];

  return (
    <div className="block w-full max-w-full gap-5 space-y-5 max-md:grid-cols-1">
      {spotlightItems.map((spotlight) => (
        <SpotlightCard key={spotlight.id} spotlight={spotlight} />
      ))}
    </div>
  );
};
