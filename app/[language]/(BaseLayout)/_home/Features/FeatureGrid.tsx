'use client';

import { cn } from '@/utils/cn';
import { FeatureCard } from './FeatureCard';
import './Features.css';

interface FeatureGridProps {
  className?: string;
}

export function FeatureGrid({ className }: FeatureGridProps) {
  const features = [
    {
      title: '個人學習管理',
      description: '有計劃、追蹤進度、記錄反思',
      icon: '📊',
      tag: '不再混亂',
      details: [
        '長期計劃或短期實踐，掌控學習節奏',
        '追蹤項目進度，將目標轉化為行動',
        '定期記錄覆盤，深化學習',
      ],
    },
    {
      title: '社群支持',
      description: '分享學習想法和心得，在互動討論中找到志同道合夥伴',
      icon: '🤝',
      tag: '不再孤單',
      details: [
        '貝殼表達感謝，鼓勵知識和學習的分享',
        '所有互動都為了加深理解、促進成長',
        '建立學習連結，共同探索而非相互競爭',
      ],
    },
    {
      title: '成長視覺化',
      description: '記錄每一步努力，讓每個突破都清晰可見',
      icon: '📈',
      tag: '不再無感',
      details: [
        '學習紀錄和活躍度呈現，看見成長軌跡',
        '個人技能地圖，視覺化個人成長發展',
      ],
    },
  ];

  return (
    <section className={cn('py-20 bg-white', className)} id="feature">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            告別三大學習困境
          </h2>
          <h3 className="text-lg text-gray-600 max-w-2xl mx-auto">
            從學習痛點到美好體驗，讓每一步成長都看得見
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="text-center mb-4">
                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {feature.tag}
                </div>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
              </div>
              
              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
