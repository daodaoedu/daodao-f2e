'use client';

import Image from 'next/image';
import { cn } from '@/utils/cn';
import { SectionHeader } from '@/app/[language]/(BaseLayout)/SectionHeader';
import './Plans.css';

interface PlanSectionProps {
  className?: string;
}

export function PlanSection({ className }: PlanSectionProps) {
  return (
    <section className={cn('section-block plans', className)} id="plans">
      <SectionHeader
        title="加入島島阿學"
        subtitle="搶先體驗完整學習平台，與我們一起打造更好的學習體驗"
        variant="default"
        size="lg"
        alignment="center"
      />

      <div className="container">
        <div className="desktop-row align-items-center">
          <div className="plan-items">
            {/* 裝飾元素 - 半圓 */}
            <Image 
              src="/assets/landing-page/deco-semicircle.svg" 
              alt="裝飾半圓" 
              width={120} 
              height={120} 
              className="absolute"
              style={{ left: '-60px', top: '-50px', zIndex: -1 }}
            />

            <h2>探索所有功能，完全免費！</h2>
            <p className="tiny">作為早期使用者，你將可以免費使用所有功能</p>

            <ul className="feature-list">
              <li>建立學習計劃和主題實踐</li>
              <li>分享學習想法和資源</li>
              <li>AI 學習建議和分析</li>
              <li>成長地圖看見自己的進步和機會</li>
              <li>優先獲得新功能體驗</li>
            </ul>

            <div className="btn btn-orange btn-large" style={{ marginTop: '24px' }}>
              立即免費註冊
            </div>
            <p className="tiny">Beta 期間完全免費 • 無需信用卡</p>

            {/* 裝飾元素 - 幾何圖形 */}
            <Image 
              src="/assets/landing-page/deco-geometries.svg" 
              alt="裝飾幾何圖形" 
              width={100} 
              height={100} 
              className="absolute"
              style={{ right: '-50px', bottom: '-50px' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
