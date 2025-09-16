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
import { useParallax } from '@/hooks/useParallax';

interface FunctionCarouselProps {
  className?: string;
}

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


export function FunctionCarousel({ className }: FunctionCarouselProps) {
  
  const ribbonParallax = useParallax<HTMLPictureElement>({ direction: 'up' });

  return (
    <section className={cn('relative pt-16 overflow-x-clip flex flex-col items-center justify-center bg-cyan-50', className)} id="functions">
      <div 
        className="text-teal-800 py-15 px-6"
      >
        <SectionHeader
          title="學習群島上的功能生態"
          variant="dark"
          size="md"
          alignment="center"
          showSubtitle={false}
        />
      </div>

      <div 
        className="w-full px-6 py-4"
      >
        <Carousel
          opts={{
            align: 'start',
            loop: false,
            dragFree: true,
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4 items-stretch xl:justify-center">
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
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 flex xl:hidden gap-2">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>

      {/* 底部裝飾圖片 - 使用視差效果 */}
      <picture 
        ref={ribbonParallax.ref}
        style={ribbonParallax.style}
        className="w-full"
      >
        <source media="(max-width: 767.98px)" srcSet="/assets/landing-page/ribbon-mobile.svg" />
        <Image
          src="/assets/landing-page/ribbon-desktop.svg"
          alt="更多功能持續進化為你帶來美好的學習生活"
          width={1200}
          height={200}
          className="w-full"
        />
      </picture>
    </section>
  );
}
