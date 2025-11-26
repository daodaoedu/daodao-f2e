import { Image } from '@/shared/ui/image';
import { CustomLink } from '@/shared/ui/custom-link';
import { cn } from '@/shared/lib/cn';

interface PersonalitySectionProps {
  className?: string;
}

export function PersonalitySection({ className }: PersonalitySectionProps) {
  return (
    <section
      className={cn(
        'relative h-[780px] w-full bg-cover bg-center bg-no-repeat md:h-[520px] lg:h-[700px]',
        'bg-[url("/assets/landing-page/bg-personality-test-mobile.png")]',
        'md:bg-[url("/assets/landing-page/bg-personality-test-desktop.png")]',
        className
      )}
      id="personality-test"
    >
      <div className="container mx-auto flex h-full flex-col justify-start lg:pt-24">
        <div className="flex w-full flex-col items-center justify-center md:flex-row">
          <div className="relative z-10 w-full text-center md:max-w-[44%] md:text-left xl:max-w-[30%]">
            <h2 className="mb-4 text-left text-2xl font-bold leading-tight text-primary-darker md:text-3xl">
              了解你的學習偏好，
              <br />
              獲得個人化的學習建議
              <br />
              和推薦路徑
            </h2>
            <div className="flex w-full items-center justify-start text-lg text-primary-darker">
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

          <div className="relative z-10">
            <CustomLink
              href="/quiz"
              className="transition-transform duration-200 hover:scale-105 hover:animate-jelly"
            >
              <Image
                src="/assets/landing-page/button-personality-test.svg"
                alt="點擊進入心理測驗"
                width={192}
                height={192}
              />
            </CustomLink>
          </div>
        </div>
      </div>

      {/* 裝飾元素 - 吉祥物 */}
      <div className="absolute right-3 top-8 z-0">
        <div className="relative aspect-[120/127] w-[120px]">
          <Image
            src="/assets/landing-page/deco-mascot.svg"
            alt="吉祥物裝飾"
            fill
          />
        </div>
      </div>

      {/* 裝飾元素 - 物品 */}
      <div className="absolute left-3 top-32 z-0">
        <div className="relative aspect-[96/155] w-[96px]">
          <Image
            src="/assets/landing-page/deco-items.svg"
            alt="物品裝飾"
            fill
          />
        </div>
      </div>
    </section>
  );
}
