'use client';

import { cn } from '@/utils/cn';
import { FunctionCard } from './FunctionCard';
import './Functions.css';

interface FunctionCarouselProps {
  className?: string;
}

export function FunctionCarousel({ className }: FunctionCarouselProps) {
  const functions = [
    {
      title: '想法',
      description: '捕捉並分享受到啟發的時刻。在這裡，每個想法都可能點亮別人的學習之路。',
      icon: '💡',
      color: 'bg-blue-100',
      action: '馬上開始',
    },
    {
      title: '主題實踐',
      description: '用 7-30 天的時間嘗試新主題，發現你的興趣。定時打卡，紀錄軌跡和心得！',
      icon: '🎯',
      color: 'bg-green-100',
      action: '馬上開始',
    },
    {
      title: '學習計劃',
      description: '為重要目標建立完整的學習計劃。設定目標、追蹤進度、累積成長！',
      icon: '📚',
      color: 'bg-purple-100',
      action: '馬上開始',
    },
    {
      title: '資源',
      description: '探索社群推薦的優質學習資源，分享你用過的好內容，並留下真實使用心得。',
      icon: '🔗',
      color: 'bg-yellow-100',
      action: '馬上開始',
    },
  ];

  return (
    <section className={cn('py-20 bg-blue-50', className)} id="functions">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            學習群島上的功能生態
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {functions.map((func, index) => (
            <FunctionCard
              key={index}
              title={func.title}
              description={func.description}
              icon={func.icon}
              color={func.color}
              action={func.action}
            />
          ))}
        </div>

        {/* 底部裝飾圖片 */}
        <div className="w-full">
          <picture className="w-full">
            <source media="(max-width: 767.98px)" srcSet="/assets/ribbon-mobile.svg" />
            <img 
              src="/assets/ribbon-desktop.svg" 
              className="w-full" 
              alt="功能生態裝飾" 
              loading="lazy" 
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
