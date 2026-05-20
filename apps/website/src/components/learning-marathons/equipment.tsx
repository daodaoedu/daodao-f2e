"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";

// 定義類型
type EquipmentItem = {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  features: Array<{
    id: string;
    text: string;
  }>;
};

// 裝備卡片組件
const EquipmentCard = ({ equipment }: { equipment: EquipmentItem }) => {
  return (
    <div className={cn("h-[300px] rounded-[10px] p-6", equipment.backgroundColor)}>
      <h3 className="mb-8 text-lg font-bold leading-[140%] text-[#293A3D]">
        {equipment.title}
        <br />
        {equipment.subtitle}
      </h3>
      <div className="mt-8">
        <ul className="list-disc pl-4">
          {equipment.features.map((feature) => (
            <li
              key={feature.id}
              className="text-left text-sm font-normal leading-[140%] text-[#293A3D]"
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
 * 學習馬拉松裝備展示組件
 */
export const Equipment = () => {
  const t = useTranslations("learning_marathon");

  const equipmentItems: EquipmentItem[] = [
    {
      id: "professional-mentor",
      title: t("equipment_mentor_title"),
      subtitle: t("equipment_mentor_subtitle"),
      backgroundColor: "bg-[#DEF5F5]",
      features: [
        { id: "one-on-one", text: t("equipment_mentor_feature_1") },
        { id: "group-consultation", text: t("equipment_mentor_feature_2") },
        { id: "feedback", text: t("equipment_mentor_feature_3") },
      ],
    },
    {
      id: "professional-course",
      title: t("equipment_course_title"),
      subtitle: t("equipment_course_subtitle"),
      backgroundColor: "bg-[#DEEDF5]",
      features: [
        { id: "strategy", text: t("equipment_course_feature_1") },
        { id: "method", text: t("equipment_course_feature_2") },
        { id: "people", text: t("equipment_course_feature_3") },
        { id: "presentation", text: t("equipment_course_feature_4") },
      ],
    },
    {
      id: "community",
      title: t("equipment_community_title"),
      subtitle: t("equipment_community_subtitle"),
      backgroundColor: "bg-[#DEF5E7]",
      features: [
        { id: "monthly-meeting", text: t("equipment_community_feature_1") },
        { id: "study-group", text: t("equipment_community_feature_2") },
        { id: "discord", text: t("equipment_community_feature_3") },
        { id: "partner-finding", text: t("equipment_community_feature_4") },
      ],
    },
    {
      id: "ai-tools",
      title: t("equipment_ai_title"),
      subtitle: t("equipment_ai_subtitle"),
      backgroundColor: "bg-[#DEF5F5]",
      features: [
        { id: "learning-template", text: t("equipment_ai_feature_1") },
        { id: "learning-journal", text: t("equipment_ai_feature_2") },
        { id: "feedback-area", text: t("equipment_ai_feature_3") },
        { id: "progress-tracking", text: t("equipment_ai_feature_4") },
        { id: "self-checklist", text: t("equipment_ai_feature_5") },
        { id: "sharing-platform", text: t("equipment_ai_feature_6") },
        { id: "ai-recommendation", text: t("equipment_ai_feature_7") },
      ],
    },
  ];

  return (
    <div className="grid w-full max-w-full grid-cols-2 grid-rows-2 gap-5 max-md:grid-cols-1 max-md:grid-rows-none">
      {equipmentItems.map((equipment) => (
        <EquipmentCard key={equipment.id} equipment={equipment} />
      ))}
    </div>
  );
};
