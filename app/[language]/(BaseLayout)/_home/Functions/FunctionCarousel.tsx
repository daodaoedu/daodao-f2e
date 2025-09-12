'use client';

import Image from 'next/image';
import { cn } from '@/utils/cn';
import { SectionHeader } from '@/app/[language]/(BaseLayout)/SectionHeader';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { FunctionCard } from './FunctionCard';

interface FunctionCarouselProps {
  className?: string;
}

export function FunctionCarousel({ className }: FunctionCarouselProps) {
  const functions = [
    {
      tag: '想法',
      title: '分享學習洞察',
      description: '捕捉並分享受到啟發的時刻。在這裡，每個想法都可能點亮別人的學習之路。',
      imageUrl: 'https://picsum.photos/200/300?grayscale',
      action: '馬上開始',
    },
    {
      tag: '主題實踐',
      title: '輕鬆開始學習探索',
      description: '用 7-30 天的時間嘗試新主題，發現你的興趣。定時打卡，紀錄軌跡和心得！',
      imageUrl: 'https://picsum.photos/200/300?grayscale',
      action: '馬上開始',
    },
    {
      tag: '學習計劃',
      title: '打造你的學習基地',
      description: '為重要目標建立完整的學習計劃。設定目標、追蹤進度、累積成長！',
      imageUrl: 'https://picsum.photos/200/300?grayscale',
      action: '馬上開始',
    },
    {
      tag: '資源',
      title: '發現與分享學習資源',
      description: '探索社群推薦的優質學習資源，分享你用過的好內容，並留下真實使用心得。',
      imageUrl: 'https://picsum.photos/200/300?grayscale',
      action: '馬上開始',
    },
  ];

  return (
    <section className={cn('relative pt-16 overflow-x-clip flex flex-col items-center justify-center bg-cyan-50', className)} id="functions">
      <div className="text-teal-800 py-15 px-6">
        <SectionHeader
          title="學習群島上的功能生態"
          variant="dark"
          size="md"
          alignment="center"
          showSubtitle={false}
          className="text-teal-800"
        />
      </div>
      
      <div className="w-full px-6">
        <Carousel
          opts={{
            align: 'start',
            loop: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 items-stretch">
            {functions.map((func) => (
              <CarouselItem key={func.title} className="pl-4 basis-auto flex ">
                <FunctionCard
                  tag={func.tag}
                  title={func.title}
                  description={func.description}
                  imageUrl={func.imageUrl}
                  action={func.action}
                  className="h-full"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="flex left-4" />
          <CarouselNext className="flex right-4" />
        </Carousel>
      </div>
      
      {/* 底部裝飾圖片 */}
      <picture className="w-full">
        <source media="(max-width: 767.98px)" srcSet="/assets/landing-page/ribbon-mobile.svg" />
        <Image 
          src="/assets/landing-page/ribbon-desktop.svg" 
          alt="功能生態裝飾" 
          width={1200}
          height={200}
          className="w-full" 
          priority={false}
          data-preload
        />
      </picture>
    </section>
  );
}
