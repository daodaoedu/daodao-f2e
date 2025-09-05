'use client';

import { cn } from '@/utils/cn';
import { SectionHeader } from '@/app/[language]/(BaseLayout)/SectionHeader';
import Image from 'next/image';

interface SloganSectionProps {
  className?: string;
}

export function SloganSection({ className }: SloganSectionProps) {
  return (
    <section className={cn('slogan-section bg-primary-palest px-6 py-8 text-basic-400 md:py-[100px] relative', className)}>
      <div className="mx-auto max-w-[750px] lg:ml-56 lg:mr-12 xl:mx-auto">
        <SectionHeader
          title="每個人都有自己的學習小島，透過交流與分享，連結成群島"
          subtitle="Where personal growth meets collective wisdom!"
          variant="primary"
          size="md"
          alignment="center"
          titleClassName="text-primary-darker"
          subtitleClassName="text-basic-400 italic"
        />
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
