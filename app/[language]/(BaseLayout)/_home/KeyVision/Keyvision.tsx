'use client';

import { Image } from '@/components/ui/image';
import LottieHero from './LottieHero';

export function KeyVision() {
  return (
    <div className="relative md:pb-48">
      <Image
        src="/assets/landing-page/deco-comma.svg"
        alt="裝飾逗號"
        width={83}
        height={97}
        className="absolute md:top-6"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6 relative pt-24 md:pt-32">
        <div className="col-span-12 md:col-span-6 flex flex-col justify-center items-center relative font-semibold text-center w-fit mx-auto md:pl-16 md:text-left md:items-start md:justify-start" id="top">
          <Image
            src="/assets/landing-page/deco-flower-orange.svg"
            alt="裝飾橘花"
            width={44}
            height={39}
            className="absolute top-0 left-0 w-6 h-6 md:w-6 md:h-6"
          />
          <Image
            src="/assets/landing-page/deco-arrow.svg"
            alt="裝飾箭頭"
            width={93}
            height={75}
            className="absolute -top-5 -right-12"
          />
          <Image
            src="/assets/landing-page/logo.svg"
            alt="島島阿學 Logo"
            width={200}
            height={44}
            className="mb-8"
          />
          <h2 className="text-2xl text-primary-darker leading-relaxed">
            讓學習成為充滿<br />
            <span className="text-3xl text-primary-base">
              自我掌握、互助支持<br />
              和看得見進步的美好日常
            </span>
          </h2>

          <button 
            type="button" 
            className="flex justify-center items-center rounded-[40px] border-2 border-tips bg-tips text-white px-5 h-12 w-36 md:h-14 md:w-45 font-semibold cursor-pointer transition-all duration-300 ease-in-out hover:!bg-white hover:!text-tips hover:-translate-y-0.5 hover:shadow-[0_12px_20px_0_rgba(255,161,11,0.3)] active:translate-y-0 shadow-[0_8px_10px_0_rgba(255,161,11,0.2)] text-base md:text-lg mt-8"
          >
            立即加入
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="ml-2 w-5 h-5"
            >
              <path d="M5 12h14" strokeWidth="2" />
              <path d="M12 5l7 7-7 7" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className="col-span-12 md:col-span-6">
          <LottieHero
            className="w-full h-auto"
            desktopSrc="/assets/landing-page/key-vision-desktop.json"
            mobileSrc="/assets/landing-page/key-vision-mobile.json"
            breakpoint={768}
            preserveAspectRatio="xMidYMid meet"
          />
        </div>
      </div>
    </div>
  );
}

