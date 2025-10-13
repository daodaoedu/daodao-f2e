import { cn } from '@/shared/lib/cn';
import { SectionHeader } from '@/shared/ui/section-header';
import Image from 'next/image';

interface SloganSectionProps {
  className?: string;
}

export function SloganSection({ className }: SloganSectionProps) {
  return (
    <section
      className={cn(
        'slogan-section relative min-h-[195px] bg-primary-palest px-6 text-basic-400 md:min-h-[200px]',
        className
      )}
    >
      {/* 背景島嶼裝飾圖片 */}
      <div className="absolute left-1/2 top-16 z-10 -translate-x-1/2 md:-top-4">
        <Image
          src="/assets/landing-page/deco-island.svg"
          alt="島嶼裝飾"
          width={429}
          height={208}
          data-preload
        />
      </div>

      {/* 文字內容 */}
      <div className="absolute left-1/2 top-32 z-10 w-full -translate-x-1/2 -translate-y-1/2">
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
          titleClassName="text-primary-darker text-[22px]"
          subtitleClassName="text-basic-400 italic"
        />
      </div>
    </section>
  );
}
