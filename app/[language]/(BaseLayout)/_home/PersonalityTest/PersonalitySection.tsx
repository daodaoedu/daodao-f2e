'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/cn';


interface PersonalitySectionProps {
  className?: string;
}

export function PersonalitySection({ className }: PersonalitySectionProps) {

  return (
    <section 
      className={cn(
        'relative bg-cover bg-no-repeat bg-center h-[780px] md:h-[520px] lg:h-[700px] w-full',
        'bg-[url("/assets/landing-page/bg-personality-test-mobile.png")]',
        'md:bg-[url("/assets/landing-page/bg-personality-test-desktop.png")]',
        className
      )}
      id="personality-test"
    >
      <div className="container mx-auto h-full flex flex-col justify-start lg:pt-24">
        <div className="flex flex-col items-center justify-center md:flex-row w-full">
        <div 
          className="text-center md:text-left w-full md:max-w-[44%] xl:max-w-[30%] relative z-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-primary-darker text-left leading-tight mb-4">
            了解你的學習偏好，<br />
            獲得個人化的學習建議<br />
            和推薦路徑
          </h2>
          <div className="flex items-center justify-start text-primary-darker text-lg w-full">
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
        
        <div
          className="relative z-10"
        >
          <Link href="/personality-test" className="transform hover:scale-105 transition-transform duration-200 hover:animate-jelly">
            <Image 
              src="/assets/landing-page/button-personality-test.svg" 
              alt="點擊進入心理測驗" 
              width={192} 
              height={192}
            />
          </Link>
        </div>
        </div>

        
      </div>

      {/* 裝飾元素 - 吉祥物 */}
      <Image 
        src="/assets/landing-page/deco-mascot.svg" 
        alt="吉祥物裝飾" 
        width={128} 
        height={128} 
        className="absolute top-8 right-3 z-0"
      />

      {/* 裝飾元素 - 物品 */}
      <Image 
        src="/assets/landing-page/deco-items.svg" 
        alt="物品裝飾" 
        width={96} 
        height={96} 
        className="absolute top-32 left-3 z-0"
      />
    </section>
  );
}
