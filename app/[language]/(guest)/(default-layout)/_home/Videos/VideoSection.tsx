import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/shared/ui/section-header';
import { VideoItem } from './VideoItem';

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
        className="-mt-24 lg:-mt-32 w-full bg-cover bg-no-repeat bg-center md:bg-top z-10"
        style={{
          backgroundImage: 'url("/assets/landing-page/bg-curve-green.svg")',
          height: '150px',
        }}
      />
      
      <div className="px-6 py-15  -mb-16">
        <SectionHeader
          title="兩種起點開始你的學習之旅"
          subtitle="分享想法開始討論，嘗試實踐記錄成長"
          variant="light"
          size="lg"
          alignment="center"
          className="text-white"
        />
      </div>

      <div className="container">
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
        <Button 
          variant="ctaOrange"
          size="huge"
        >
          開始分享想法
        </Button>
      </div>
    </section>
  );
}
