'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import './PersonalityTest.css';

interface PersonalitySectionProps {
  className?: string;
}

export function PersonalitySection({ className }: PersonalitySectionProps) {
  return (
    <section className={cn('py-20 bg-white relative', className)}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左側標題和說明 */}
          <div className="personality-title">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              了解你的學習偏好，<br />
              獲得個人化的學習建議<br />
              和推薦路徑
            </h2>
            <div className="flex items-center text-primary mb-8">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <polyline points="12,6 12,12 16,14" strokeWidth="2" />
              </svg>
              2-3分鐘
            </div>
          </div>

          {/* 右側進入按鈕 */}
          <div className="text-center">
            <a 
              href="/personality-test" 
              className="inline-block mb-8 transform hover:scale-105 transition-transform"
            >
              <div className="w-48 h-48 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-center text-white">
                  <div className="text-2xl mb-2">🧠</div>
                  <div className="text-lg font-semibold">心理測驗</div>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* 底部按鈕和說明 */}
        <div className="text-center mt-12">
          <Button size="lg" className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700">
            查看個人化結果
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
          <p className="text-gray-600 mt-4">獲得專屬學習建議</p>
        </div>

        {/* 裝飾元素 */}
        <div className="absolute top-10 right-0 w-32 h-32 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full" />
        </div>
        <div className="absolute top-30 left-0 w-24 h-24 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-secondary to-primary rounded-full" />
        </div>
      </div>
    </section>
  );
}
