'use client';

import { cn } from '@/utils/cn';
import { FeatureCard } from './FeatureCard';

interface FeatureGridProps {
  className?: string;
}

export function FeatureGrid({ className }: FeatureGridProps) {
  const features = [
    {
      title: '個人學習管理',
      description: '有計劃、追蹤進度、記錄反思',
      tag: '不再混亂',
      image: '/assets/landing-page/feature-tracker.png',
      details: [
        '長期計劃或短期實踐，掌控學習節奏',
        '追蹤項目進度，將目標轉化為行動',
        '定期記錄覆盤，深化學習',
      ],
    },
    {
      title: '社群支持',
      description: '分享學習想法和心得，在互動討論中找到志同道合夥伴',
      tag: '不再孤單',
      image: '/assets/landing-page/feature-community.png',
      details: [
        '貝殼表達感謝，鼓勵知識和學習的分享',
        '所有互動都為了加深理解、促進成長',
        '建立學習連結，共同探索而非相互競爭',
      ],
    },
    {
      title: '成長視覺化',
      description: '記錄每一步努力，讓每個突破都清晰可見',
      tag: '不再無感',
      image: '/assets/landing-page/feature-chart.png',
      details: [
        '學習紀錄和活躍度呈現，看見成長軌跡',
        '個人技能地圖，視覺化個人成長發展',
      ],
    },
  ];

  return (
    <div className={cn('pt-16 w-full', className)}>
      <div className="container">
        <div className="relative pb-[60px] overflow-x-clip flex flex-col items-center justify-center" id="feature">
        <div className="text-primary-darker px-6 py-[60px] pb-10 text-center">
          <h2 className="text-[28px] font-semibold mb-2">告別三大學習困境</h2>
          <h3 className="text-sm">從學習痛點到美好體驗，讓每一步成長都看得見</h3>
        </div>
        <div className="text-primary-darker flex flex-col items-stretch md:flex-row">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              tag={feature.tag}
              image={feature.image}
              details={feature.details}
            />
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
