'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { SectionHeader } from '@/app/[language]/(BaseLayout)/SectionHeader';


interface PersonalitySectionProps {
  className?: string;
}

export function PersonalitySection({ className }: PersonalitySectionProps) {
  return (
    <section 
      className={cn(
        'relative bg-contain bg-no-repeat bg-bottom h-[800px] flex flex-col justify-start px-6',
        'md:px-[20%]',
        'bg-[url("/assets/landing-page/bg-personality-test-mobile.png")]',
        'md:bg-[url("/assets/landing-page/bg-personality-test-desktop.png")]',
        className
      )}
      id="personality-test"
    >
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <div className="text-center space-y-4">
          <SectionHeader
            title="了解你的學習偏好，獲得個人化的學習建議和推薦路徑"
            variant="dark"
            size="lg"
            alignment="center"
            showSubtitle={false}
            titleClassName="leading-tight"
          />
          <div className="flex items-center justify-center text-green-700 text-lg">
            <Image 
              src="/assets/landing-page/icon-clock.svg" 
              alt="時鐘圖示" 
              width={20} 
              height={20} 
              className="mr-2"
            />
            2-3分鐘
          </div>
        </div>
        
        <Link href="/personality-test" className="transform hover:scale-105 transition-transform duration-200 hover:animate-jelly">
          <Image 
            src="/assets/landing-page/button-personality-test.svg" 
            alt="點擊進入心理測驗" 
            width={192} 
            height={192} 
          />
        </Link>
      </div>

      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <button type="button" className="relative bg-[#16B9B3] hover:bg-white text-white hover:text-[#16B9B3] border-2 border-[#16B9B3] rounded-[40px] h-14 w-[180px] font-semibold text-xl flex items-center justify-center space-x-2 transition-all duration-300 ease-in-out shadow-[0_8px_10px_0_rgba(22,185,179,0.1)] hover:shadow-[0_12px_20px_0_rgba(22,185,179,0.2)] hover:-translate-y-0.5 active:translate-y-0">
          <span>查看個人化結果</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </button>
        
        <p className="text-center mt-4 text-[#295E5C] font-medium">獲得專屬學習建議</p>
      </div>

      {/* 裝飾元素 - 吉祥物 */}
      <Image 
        src="/assets/landing-page/deco-mascot.svg" 
        alt="吉祥物裝飾" 
        width={128} 
        height={128} 
        className="absolute top-[10%] -right-3"
      />

      {/* 裝飾元素 - 物品 */}
      <Image 
        src="/assets/landing-page/deco-items.svg" 
        alt="物品裝飾" 
        width={96} 
        height={96} 
        className="absolute top-[30%] left-0"
      />
    </section>
  );
}
