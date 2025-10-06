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
            <Link
              href="/quiz"
              className="transition-transform duration-200 hover:scale-105 hover:animate-jelly"
            >
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
        className="absolute right-3 top-8 z-0"
      />

      {/* 裝飾元素 - 物品 */}
      <Image
        src="/assets/landing-page/deco-items.svg"
        alt="物品裝飾"
        width={96}
        height={96}
        className="absolute left-3 top-32 z-0"
      />
    </section>
  );
}
