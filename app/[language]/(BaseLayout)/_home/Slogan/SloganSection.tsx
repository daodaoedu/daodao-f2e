'use client';

import { cn } from '@/utils/cn';
import Image from 'next/image';


interface SloganSectionProps {
  className?: string;
}

export function SloganSection({ className }: SloganSectionProps) {
  return (
    <section className={cn('slogan-section bg-primary-palest px-6 py-8 text-basic-400 md:py-[100px] relative', className)}>
    
      
      <div className="mx-auto max-w-[750px] lg:ml-56 lg:mr-12 xl:mx-auto text-center">
        <h2 className="slogan-title text-2xl md:text-3xl font-bold text-basic-500 mb-6 text-primary-darker ">
          每個人都有自己的學習小島，<br />
          透過交流與分享，連結成群島
        </h2>
        <h3 className="slogan-subtitle text-lg md:text-xl text-basic-400 mb-8 italic">
          Where personal growth meets collective wisdom!
        </h3>
      </div>
        {/* 背景島嶼裝飾圖片 */}
        <div className="absolute top-0 bottom-0 opacity-60 -z-1">
        <Image
          src="/assets/landing-page/deco-island.svg"
          alt="島嶼裝飾"
          width={429}
          height={208}
          className="w-429 h-208"
        />
      </div>
    </section>
  );
}
