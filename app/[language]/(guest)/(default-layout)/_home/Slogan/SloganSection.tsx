import { cn } from '@/utils/cn';
import { SectionHeader } from '@/app/[language]/(guest)/(default-layout)/SectionHeader';
import Image from 'next/image';

interface SloganSectionProps {
  className?: string;
}

export function SloganSection({ className }: SloganSectionProps) {

  return (
    <section className={cn('slogan-section bg-primary-palest px-6  text-basic-400  relative min-h-[195px] md:min-h-[200px]', className)}>
      {/* 背景島嶼裝飾圖片 */}
      <div
        className="absolute top-16 md:-top-4 left-1/2 z-10 transform -translate-x-1/2"
      >
        <Image
          src="/assets/landing-page/deco-island.svg"
          alt="島嶼裝飾"
          width={429}
          height={208}
          data-preload
        />
      </div>
      
      {/* 文字內容 */}
      <div
        className="absolute top-32 left-1/2 z-10 w-full transform -translate-x-1/2 -translate-y-1/2"
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
