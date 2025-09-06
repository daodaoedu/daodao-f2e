'use client';

import { cn } from '@/utils/cn';
import { VideoItem } from './VideoItem';
import { SectionHeader } from '../../SectionHeader';

interface VideoSectionProps {
  className?: string;
}

export function VideoSection({ className }: VideoSectionProps) {
  const videos = [
    {
      title: '分享學習想法',
      subtitle: '記錄、討論、影響',
      tags: ['記錄學習瞬間', '獲得社群回饋', '建立影響力'],
    },
    {
      title: '開始主題實踐',
      subtitle: '探索、記錄、成長',
      tags: ['探索新領域', '追蹤進度', '保持動力'],
    },
  ];

  return (
    <section className={cn(
      'relative flex flex-col items-center justify-center pb-16',
      'bg-primary-base',
      className
    )}>
      {/* 頂部曲線裝飾 */}
      <div 
        className="-mt-[100px] w-full bg-cover bg-no-repeat bg-center md:bg-top z-10"
        style={{
          backgroundImage: 'url("/assets/landing-page/bg-curve-green.svg")',
          height: '150px'
        }}
      />
      
      <div className="px-6 py-15  -mb-[30px]">
        <SectionHeader
          title="兩種起點開始你的學習之旅"
          subtitle="分享想法開始討論，嘗試實踐記錄成長"
          variant="light"
          size="lg"
          alignment="center"
          className="text-white"
        />
      </div>

      <div className="px-6 w-full max-w-[708px] mx-auto md:max-w-[1140px]">
        <div className="w-full flex flex-col md:flex-row gap-6">
          {videos.map((video) => (
            <VideoItem
              key={video.title}
              title={video.title}
              subtitle={video.subtitle}
              tags={video.tags}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center w-full">
        <button className="
          flex justify-center items-center rounded-[40px] border-none px-5 cursor-pointer
          transition-all duration-300 ease-in-out
          h-14 w-45 text-xl font-semibold
          bg-tips border-2 border-tips text-basic-white
          shadow-[0_8px_10px_0_rgba(255,149,38,0.2)]
          hover:bg-basic-white hover:text-tips
        ">
          開始分享想法
        </button>
      </div>
    </section>
  );
}
