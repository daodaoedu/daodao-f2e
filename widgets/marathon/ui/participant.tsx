import { Title } from '@/shared/ui/typography';
import { Image } from '@/shared/ui/image';
import { cn } from '@/shared/lib/cn';
import { StaticImageData } from 'next/image';
import React from 'react';

// 引入圖片
import PersonaImage1 from '@/public/assets/learning-marathon/marathon-persona-1.png';
import PersonaImage2 from '@/public/assets/learning-marathon/marathon-persona-2.png';
import PersonaImage3 from '@/public/assets/learning-marathon/marathon-persona-3.png';
import PersonaImage4 from '@/public/assets/learning-marathon/marathon-persona-4.png';

// 定義類型
type ParticipantType = {
  id: string;
  image: StaticImageData;
  title: string;
  backgroundColor: string;
};

// 參與者資料
const participants: ParticipantType[] = [
  {
    id: 'career-preparation',
    image: PersonaImage1,
    title: '有模糊的職涯／生涯方向，\n想開始做準備與鋪路',
    backgroundColor: 'bg-white',
  },
  {
    id: 'experience-based-education',
    image: PersonaImage2,
    title: '考試不適合我，\n更想用個人經歷上大學',
    backgroundColor: 'bg-[#DEEDF5]',
  },
  {
    id: 'interest-driven-learning',
    image: PersonaImage3,
    title: '學校課程好無聊，希望可以用\n自己的方式學有興趣的事情',
    backgroundColor: 'bg-[#DEF5E7]',
  },
  {
    id: 'self-directed-learning',
    image: PersonaImage4,
    title: '想自主學習，\n有方向但不確定可以怎麼開始',
    backgroundColor: 'bg-white',
  },
];

// 參與者卡片組件
const ParticipantCard = ({ participant }: { participant: ParticipantType }) => {
  return (
    <div
      className={cn(
        'h-[300px] rounded-[10px] px-8 py-10 text-center',
        participant.backgroundColor
      )}
    >
      <div className="mb-2 h-[160px]">
        <Image
          alt={`marathon-persona-${participant.id}`}
          src={participant.image.src}
          width={200}
          height={160}
          className="mx-auto block object-cover object-center"
        />
      </div>
      <Title className="whitespace-pre-line text-center text-lg font-bold leading-[140%] text-[#293A3D]">
        {participant.title}
      </Title>
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
}
