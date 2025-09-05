'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { VideoItem } from './VideoItem';
import './Videos.css';

interface VideoSectionProps {
  className?: string;
}

export function VideoSection({ className }: VideoSectionProps) {
  const videos = [
    {
      title: '分享學習想法',
      subtitle: '記錄、討論、影響',
      description: '分享你的學習想法，與社群互動討論，建立影響力',
      tags: ['記錄學習瞬間', '獲得社群回饋', '建立影響力'],
      videoSrc: '/assets/video-1.mp4',
    },
    {
      title: '開始主題實踐',
      subtitle: '探索、記錄、成長',
      description: '用 7-30 天的時間嘗試新主題，發現你的興趣',
      tags: ['探索新領域', '追蹤進度', '保持動力'],
      videoSrc: '/assets/video-2.mp4',
    },
  ];

  return (
    <section className={cn('py-20 bg-green-600 relative', className)}>
      {/* 頂部曲線裝飾 */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white rounded-b-full" />
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16 -mt-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            兩種起點開始你的學習之旅
          </h2>
          <h3 className="text-xl text-white/90 max-w-2xl mx-auto">
            分享想法開始討論，嘗試實踐記錄成長
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {videos.map((video, index) => (
            <VideoItem
              key={index}
              title={video.title}
              subtitle={video.subtitle}
              description={video.description}
              tags={video.tags}
              videoSrc={video.videoSrc}
            />
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="px-8 py-4 text-lg bg-orange-500 hover:bg-orange-600">
            開始分享想法
          </Button>
        </div>
      </div>
    </section>
  );
}
