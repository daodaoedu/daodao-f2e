import { cn } from '@/utils/cn';
import { Button } from '@/shared/ui/button';
import { SectionHeader } from '@/shared/ui/section-header';

interface VideoItemProps {
  title: string;
  subtitle: string;
  tags: string[];
  className?: string;
}

function VideoItem({ title, subtitle, tags, className }: VideoItemProps) {
  return (
    <div className={cn('mb-6 w-full py-6 md:w-1/2', className)}>
      <video controls className="aspect-video w-full rounded-[20px]">
        <source />
        <track kind="captions" srcLang="zh-TW" label="繁體中文" />
      </video>

      <div className="mb-5 mt-2 rounded-[20px] bg-mascot-aqua px-4 py-2 text-center text-primary-darker">
        <p className="text-xl font-semibold">
          {title}
          <span className="pl-2 text-sm">{subtitle}</span>
        </p>
      </div>

      <div className="flex flex-wrap justify-center">
        {tags.map((tag) => (
          <p
            key={tag}
            className={cn(
              'relative m-1 rounded-[20px] bg-basic-white px-3 py-1.5 pl-[30px] text-sm text-primary-darker',
              "before:absolute before:left-2 before:top-1/2 before:size-4 before:-translate-y-1/2 before:content-[url('/assets/landing-page/icon-check.svg')]"
            )}
          >
            {tag}
          </p>
        ))}
      </div>
    </div>
  );
}

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
    <section
      className={cn(
        'relative flex flex-col items-center justify-center pb-16',
        'bg-primary-base',
        className
      )}
    >
      {/* 頂部曲線裝飾 */}
      <div
        className="z-10 -mt-24 w-full bg-cover bg-center bg-no-repeat md:bg-top lg:-mt-32"
        style={{
          backgroundImage: 'url("/assets/landing-page/bg-curve-green.svg")',
          height: '150px',
        }}
      />

      <div className="py-15 -mb-16 px-6">
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
        <div className="flex w-full flex-col gap-6 md:flex-row">
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

      <div className="flex w-full justify-center">
        <Button variant="ctaOrange" size="huge">
          開始分享想法
        </Button>
      </div>
    </section>
  );
}
