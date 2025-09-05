'use client';

import { cn } from '@/utils/cn';
import './Presentation.css';

interface PresentationSectionProps {
  className?: string;
}

export function PresentationSection({ className }: PresentationSectionProps) {
  return (
    <section className={cn('py-20 bg-gray-900 relative', className)}>
      {/* 裝飾元素 */}
      <div className="absolute top-0 left-12 opacity-60">
        <div className="w-16 h-16 bg-yellow-300 rounded-full animate-spin" />
      </div>
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            展示你的學習成果
          </h2>
          <h3 className="text-xl text-blue-300 max-w-2xl mx-auto">
            在實踐中與眾人一同成長
          </h3>
        </div>

        {/* 學習進度展示圖片 */}
        <div className="mb-8">
          <picture className="w-full">
            <source media="(max-width: 767.98px)" srcSet="/assets/learning-progress-mobile.png" />
            <img 
              src="/assets/learning-progress-desktop.png" 
              className="w-full rounded-lg shadow-lg" 
              alt="學習進度展示" 
              loading="lazy" 
            />
          </picture>
        </div>

        {/* 裝飾元素 - 吉祥物 */}
        <div className="absolute bottom-0 right-10 opacity-80">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
            <div className="text-4xl">🎯</div>
          </div>
        </div>
      </div>
    </section>
  );
}
