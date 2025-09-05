'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import './Plans.css';

interface PlanSectionProps {
  className?: string;
}

export function PlanSection({ className }: PlanSectionProps) {
  return (
    <section className={cn('py-20 bg-white relative', className)} id="plans">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            加入島島阿學
          </h2>
          <h3 className="text-lg text-gray-600 max-w-2xl mx-auto">
            搶先體驗完整學習平台，與我們一起打造更好的學習體驗
          </h3>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 relative">
            {/* 裝飾元素 */}
            <div className="absolute -left-16 -top-12 opacity-60">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full" />
            </div>
            <div className="absolute -right-12 -bottom-12 opacity-60">
              <div className="w-24 h-24 bg-gradient-to-br from-green-200 to-blue-200 rounded-full" />
            </div>

            <div className="text-center relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                探索所有功能，完全免費！
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                作為早期使用者，你將可以免費使用所有功能
              </p>

              <ul className="space-y-3 mb-8 text-left max-w-md mx-auto">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-gray-700">建立學習計劃和主題實踐</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-gray-700">分享學習想法和資源</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-gray-700">AI 學習建議和分析</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-gray-700">成長地圖看見自己的進步和機會</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-gray-700">優先獲得新功能體驗</span>
                </li>
              </ul>

              <Button size="lg" className="px-8 py-4 text-lg bg-orange-500 hover:bg-orange-600 mb-4">
                立即免費註冊
              </Button>
              <p className="text-sm text-gray-500">
                Beta 期間完全免費 • 無需信用卡
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
