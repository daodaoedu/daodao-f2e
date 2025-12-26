import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";

// 定義類型
type ParticipantType = {
  id: string;
  image: string;
  title: string;
  backgroundColor: string;
};

// 參與者資料
const participants: ParticipantType[] = [
  {
    id: "career-preparation",
    image: "/assets/learning-marathon/marathon-persona-1.png",
    title: "有模糊的職涯／生涯方向，\n想開始做準備與鋪路",
    backgroundColor: "bg-white",
  },
  {
    id: "experience-based-education",
    image: "/assets/learning-marathon/marathon-persona-2.png",
    title: "考試不適合我，\n更想用個人經歷上大學",
    backgroundColor: "bg-[#DEEDF5]",
  },
  {
    id: "interest-driven-learning",
    image: "/assets/learning-marathon/marathon-persona-3.png",
    title: "學校課程好無聊，希望可以用\n自己的方式學有興趣的事情",
    backgroundColor: "bg-[#DEF5E7]",
  },
  {
    id: "self-directed-learning",
    image: "/assets/learning-marathon/marathon-persona-4.png",
    title: "想自主學習，\n有方向但不確定可以怎麼開始",
    backgroundColor: "bg-white",
  },
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
  return (
    <div className="grid w-full max-w-full grid-cols-2 grid-rows-2 gap-5 max-md:grid-cols-1 max-md:grid-rows-none">
      {participants.map((participant) => (
        <ParticipantCard key={participant.id} participant={participant} />
      ))}
    </div>
  );
};
