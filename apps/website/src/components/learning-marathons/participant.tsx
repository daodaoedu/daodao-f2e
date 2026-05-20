"use client";

import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";

// 定義類型
type ParticipantType = {
  id: string;
  image: string;
  title: string;
  backgroundColor: string;
};

// 靜態資料（無中文）
const participantData = [
  { id: "career-preparation", image: "/assets/learning-marathon/marathon-persona-1.png", backgroundColor: "bg-white", titleKey: "participant_career_preparation" as const },
  { id: "experience-based-education", image: "/assets/learning-marathon/marathon-persona-2.png", backgroundColor: "bg-[#DEEDF5]", titleKey: "participant_experience_education" as const },
  { id: "interest-driven-learning", image: "/assets/learning-marathon/marathon-persona-3.png", backgroundColor: "bg-[#DEF5E7]", titleKey: "participant_interest_learning" as const },
  { id: "self-directed-learning", image: "/assets/learning-marathon/marathon-persona-4.png", backgroundColor: "bg-white", titleKey: "participant_self_directed" as const },
];

// 參與者卡片組件
const ParticipantCard = ({ participant }: { participant: ParticipantType }) => {
  return (
    <div
      className={cn("h-[300px] rounded-[10px] px-8 py-10 text-center", participant.backgroundColor)}
    >
      <div className="mb-2 h-[160px]">
        <Image
          alt={`marathon-persona-${participant.id}`}
          src={participant.image}
          width={200}
          height={160}
          className="mx-auto block object-cover object-center"
        />
      </div>
      <h3 className="whitespace-pre-line text-center text-lg font-bold leading-[140%] text-[#293A3D]">
        {participant.title}
      </h3>
    </div>
  );
};

/**
 * 學習馬拉松參與者類型展示組件
 */
export const Participant = () => {
  const t = useTranslations("learning_marathon");

  const participants: ParticipantType[] = participantData.map((d) => ({
    id: d.id,
    image: d.image,
    backgroundColor: d.backgroundColor,
    title: t(d.titleKey),
  }));

  return (
    <div className="grid w-full max-w-full grid-cols-2 grid-rows-2 gap-5 max-md:grid-cols-1 max-md:grid-rows-none">
      {participants.map((participant) => (
        <ParticipantCard key={participant.id} participant={participant} />
      ))}
    </div>
  );
};
