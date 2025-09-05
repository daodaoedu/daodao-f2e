'use client';

import { cn } from '@/utils/cn';
import './Presentation.css';

interface PresentationSectionProps {
  className?: string;
}

export function PresentationSection({ className }: PresentationSectionProps) {
  return (
    <section className={cn('section-block bg-dark learning-progress relative', className)}>
      {/* 裝飾元素 - 黃色花朵 */}
      <img 
        className="position-absolute rotate" 
        src="/assets/landing-page/deco-flower-yellow.svg" 
        style={{ top: 0, left: '12%' }} 
        alt="裝飾花朵" 
      />
      
      <div className="title-group text-white">
        <h2>展示你的學習成果</h2>
        <h3 className="text-light-blue">在實踐中與眾人一同成長</h3>
      </div>

      {/* 學習進度展示圖片 */}
      <picture className="w-100">
        <source media="(max-width: 767.98px)" srcSet="/assets/landing-page/learning-progress-mobile.png" />
        <img 
          src="/assets/landing-page/learning-progress-desktop.png" 
          className="w-100" 
          alt="學習進度展示" 
          loading="lazy" 
        />
      </picture>

      {/* 裝飾元素 - 吉祥物 */}
      <img 
        className="position-absolute" 
        src="/assets/landing-page/deco-mascot-2.svg" 
        style={{ bottom: 0, right: '10%' }} 
        alt="吉祥物裝飾" 
      />
    </section>
  );
}
