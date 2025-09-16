'use client';

import { cn } from '@/utils/cn';
import Image from 'next/image';
import { SectionHeader } from '@/app/[language]/(BaseLayout)/SectionHeader';

interface PresentationSectionProps {
  className?: string;
}

export function PresentationSection({ className }: PresentationSectionProps) {
  return (
    <section className={cn('relative bg-basic-600 pt-16 md:py-24', className)}>
      {/* 裝飾元素 - 黃色花朵 */}
      <Image 
        className="absolute top-0 left-[12%] animate-spin-slow" 
        src="/assets/landing-page/deco-flower-yellow.svg" 
        alt="裝飾花朵"
        width={100}
        height={100}
      />
      
      <div className="container flex flex-col items-center justify-end text-center">
        <SectionHeader
          title="展示你的學習成果"
          subtitle="在實踐中與眾人一同成長"
          variant="light"
          alignment="center"
          titleClassName=""
          subtitleClassName="text-mascot-aqua"
        />
      </div>

      {/* 學習進度展示圖片 - 突破 container padding */}
      <div className="w-full flex justify-end md:justify-center md:container md:mx-auto">
        <div className="block w-full md:max-w-[600px]">
          <Image 
            src="/assets/landing-page/learning-progress-desktop.png" 
            className="w-full h-auto hidden md:block" 
            alt="學習進度展示" 
            width={600}
            height={400}
          />
          <Image 
            src="/assets/landing-page/learning-progress-mobile.png" 
            className="w-full h-auto block md:hidden" 
            alt="學習進度展示" 
            width={400}
            height={300}
          />
        </div>
      </div>

      {/* 裝飾元素 - 吉祥物 */}
      <Image 
        className="absolute bottom-0 right-[10%]" 
        src="/assets/landing-page/deco-mascot-2.svg" 
        alt="吉祥物裝飾"
        width={120}
        height={120}
      />
    </section>
  );
}
