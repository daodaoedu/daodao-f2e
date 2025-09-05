'use client';

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
      tags: ['記錄學習瞬間', '獲得社群回饋', '建立影響力'],
    },
    {
      title: '開始主題實踐',
      subtitle: '探索、記錄、成長',
      tags: ['探索新領域', '追蹤進度', '保持動力'],
    },
  ];

  return (
    <section className={cn('section-block videos bg-green relative', className)}>
      {/* 頂部曲線裝飾 */}
      <div className="top-curve" />
      
      <div className="title-group text-white" style={{ marginTop: '-70px', marginBottom: '-30px' }}>
        <h2>兩種起點開始你的學習之旅</h2>
        <h3>分享想法開始討論，嘗試實踐記錄成長</h3>
      </div>

      <div className="container">
        <div className="desktop-row">
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

      <div className="d-flex justify-content-center w-100">
        <div className="btn btn-orange btn-large">開始分享想法</div>
      </div>
    </section>
  );
}
