'use client';

import { cn } from '@/utils/cn';
import { SectionHeader } from '@/app/[language]/(BaseLayout)/SectionHeader';
import { useMultipleParallax } from '@/hooks/useParallax';
import Image from 'next/image';

interface SloganSectionProps {
  className?: string;
}

export function SloganSection({ className }: SloganSectionProps) {
  const [backgroundParallax, textParallax] = useMultipleParallax<HTMLDivElement>([
    { preset: 'slow' }, 
    {},                 
  ]);

  return (
    <section className={cn('slogan-section bg-primary-palest px-6  text-basic-400  relative min-h-[195px] md:min-h-[200px]', className)}>
      {/* 背景島嶼裝飾圖片 */}
      <div
        ref={backgroundParallax.ref}
        style={{
          ...backgroundParallax.style,
          transform: `translateX(-50%) ${backgroundParallax.style.transform}`,
        }}
        className="absolute top-16 md:-top-4 left-1/2 z-[1] "
      >
        <Image
          src="/assets/landing-page/deco-island.svg"
          alt="島嶼裝飾"
          width={429}
          height={208}

        />
      </div>
      
      {/* 文字內容 */}
      <div
        ref={textParallax.ref}
        style={{
          ...textParallax.style,
          transform: `translateX(-50%) translateY(-50%) ${textParallax.style.transform}`,
        }}
        className="absolute top-32 left-1/2 z-10 w-full"
      >
        <SectionHeader
          title={
            <>
              每個人都有自己的學習小島，
              <br />
              透過交流與分享，連結成群島
            </>
          }

          subtitle="Where personal growth meets collective wisdom!"
          variant="dark"
          alignment="center"
          titleClassName="text-primary-darker !text-[22px]"
          subtitleClassName="text-basic-400 italic !text-sm"
        />
      </div>

      
    </section>
  );
}
