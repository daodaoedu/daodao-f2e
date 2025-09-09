'use client';

import Image from 'next/image';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

interface PlanSectionProps {
  className?: string;
}

export function PlanSection({ className }: PlanSectionProps) {
  return (
    <section className={cn('relative pb-[60px] overflow-x-clip flex flex-col items-center justify-center', className)} id="plans">
      {/* Section Header */}
      <div className="text-primary-darker py-[60px] px-6 text-center">
        <h2 className="text-[28px] font-semibold mb-2">加入島島阿學</h2>
        <h3 className="text-sm">搶先體驗完整學習平台，與我們一起打造更好的學習體驗</h3>
      </div>

      <div className="container">
        <div className="w-full flex justify-center flex-col md:flex-row md:gap-6 items-center py-8">
          {/* 外層容器 - 用於定位裝飾元素 */}
          <div className="relative">
            {/* 裝飾元素 - 半圓 */}
            <Image 
              src="/assets/landing-page/deco-semicircle.svg" 
              alt="裝飾半圓" 
              width={120} 
              height={120} 
              className="absolute -left-16 -top-10 z-0"
            />
            
            {/* 內容區塊 */}
            <div className="flex flex-col justify-center items-center relative text-primary-darker max-w-[400px] border-2 border-primary-base rounded-[20px] p-6 bg-primary-palest z-10">

            <h2 className="text-center text-lg font-semibold">探索所有功能，完全免費！</h2>
            <p className="text-center text-[13px] mb-6 mt-2">作為早期使用者，你將可以免費使用所有功能</p>

            <ul className="list-none p-0 mb-3 w-full">
              <li className="py-2 text-primary-500 border-b border-gray-200 relative pl-10 before:absolute before:left-0 before:top-2 before:w-6 before:h-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-no-repeat before:bg-center before:bg-contain">
                建立學習計劃和主題實踐
              </li>
              <li className="py-2 text-primary-500 border-b border-gray-200 relative pl-10 before:absolute before:left-0 before:top-2 before:w-6 before:h-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-no-repeat before:bg-center before:bg-contain">
                分享學習想法和資源
              </li>
              <li className="py-2 text-primary-500 border-b border-gray-200 relative pl-10 before:absolute before:left-0 before:top-2 before:w-6 before:h-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-no-repeat before:bg-center before:bg-contain">
                AI 學習建議和分析
              </li>
              <li className="py-2 text-primary-500 border-b border-gray-200 relative pl-10 before:absolute before:left-0 before:top-2 before:w-6 before:h-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-no-repeat before:bg-center before:bg-contain">
                成長地圖看見自己的進步和機會
              </li>
              <li className="py-2 text-primary-500 relative pl-10 before:absolute before:left-0 before:top-2 before:w-6 before:h-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-no-repeat before:bg-center before:bg-contain">
                優先獲得新功能體驗
              </li>
            </ul>

            <Button 
              variant="ctaOrange"
              size="huge"
              className="mt-6"
            >
              立即免費註冊
            </Button>
            <p className="text-center text-[13px] mt-2">Beta 期間完全免費 • 無需信用卡</p>

            </div>
            
            {/* 裝飾元素 - 幾何圖形 */}
            <Image 
              src="/assets/landing-page/deco-geometries.svg" 
              alt="裝飾幾何圖形" 
              width={100} 
              height={100} 
              className="absolute -right-7 -bottom-10 z-20"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
