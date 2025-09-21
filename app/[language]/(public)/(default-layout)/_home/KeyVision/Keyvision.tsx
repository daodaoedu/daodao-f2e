import { Image } from '@/components/ui/image';
import { Icon } from '@/components/ui/icon';
import { AuthButton } from '@/contexts/Auth';
import LottieHero from './LottieHero';

export function KeyVision() {

  return (
    <div className="relative md:pb-32">
      <Image
          src="/assets/landing-page/deco-comma.svg"
          alt="裝飾逗號"
          width={83}
          height={97}
          className="absolute md:top-6"
          data-preload
        />
      <div className=" mx-auto max-w-none px-0 md:px-16 xl:px-24">
        
        <div className="grid grid-cols-12 relative pt-24 md:pt-32">
        <div className="col-span-12 md:col-span-4 lg:col-span-5 flex flex-col justify-center items-center relative font-semibold text-center w-fit mx-auto md:text-left md:items-start md:pl-4 lg:pl-32" id="top">
          <Image
            src="/assets/landing-page/deco-flower-orange.svg"
            alt="裝飾橘花"
            width={44}
            height={39}
            className="absolute top-0 left-0 w-6 h-6 md:w-16 md:h-16 z-0"
            data-preload
          />
          <Image
            src="/assets/landing-page/deco-arrow.svg"
            alt="裝飾箭頭"
            width={93}
            height={75}
            className="absolute -top-5 -right-12 z-0"
            data-preload
          />
          <Image
            src="/assets/landing-page/logo.svg"
            alt="島島阿學 Logo"
            width={200}
            height={44}
            className="mb-8 relative z-20"
            data-preload
            priority
          />
          <h2 className="text-xl xl:text-2xl text-primary-darker relative z-20 space-y-3">
            <div>讓學習成為充滿</div>
            <div className="text-2xl xl:text-3xl text-primary-base space-y-3">
              <div>自我掌握、互助支持</div>
              <div>和看得見進步的美好日常</div>
            </div>
          </h2>

          <AuthButton 
            variant="ctaOrange"
            size="huge"
            className="mt-8 relative z-20"
          >
            立即加入
            <Icon name="arrow-right" className="ml-2" />
          </AuthButton>
        </div>

        <div className="col-span-12 md:col-span-8 lg:col-span-7 flex justify-center md:justify-start md:pr-2 lg:pr-24">
          <LottieHero
            desktopSrc="/assets/landing-page/key-vision-desktop.json"
            mobileSrc="/assets/landing-page/key-vision-mobile.json"
            preserveAspectRatio="xMidYMid meet"
          />
        </div>
        </div>
      </div>
    </div>
  );
}

