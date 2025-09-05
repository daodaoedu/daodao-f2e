'use client';

import { Image } from '@/components/ui/image';
import LottieHero from './LottieHero';

export function KeyVision() {
  return (
    <div className="section-block key-vision">
      <div className="title" id="top">
        <Image
          src="/assets/landing-page/deco-comma.svg"
          alt="裝飾逗號"
          width={24}
          height={24}
          className="w-6 h-6 md:w-6 md:h-6"
        />
        <Image
          src="/assets/landing-page/deco-flower-orange.svg"
          alt="裝飾橘花"
          width={24}
          height={24}
          className="w-6 h-6 md:w-6 md:h-6"
        />
        <Image
          src="/assets/landing-page/deco-arrow.svg"
          alt="裝飾箭頭"
          width={24}
          height={24}
          className="w-6 h-6 md:w-6 md:h-6"
        />
        <Image 
          src="/assets/landing-page/logo.svg" 
          alt="島島阿學 Logo" 
          width={120}
          height={40}
          className="w-24 h-10 md:w-30 md:h-10"
        />
        <h2 className="text-lg md:text-xl lg:text-2xl">讓學習成為充滿<br /><span className="text-xl md:text-2xl lg:text-3xl">自我掌握、互助支持<br />和看得見進步的美好日常</span></h2>

        <button type="button" className="flex justify-center items-center rounded-[40px] border-2 border-[#FFA10B] bg-[#FFA10B] text-white px-5 h-12 w-36 md:h-14 md:w-45 font-semibold cursor-pointer transition-all duration-300 ease-in-out hover:bg-white hover:text-[#FFA10B] hover:-translate-y-0.5 hover:shadow-[0_12px_20px_0_rgba(255,161,11,0.3)] active:translate-y-0 shadow-[0_8px_10px_0_rgba(255,161,11,0.2)] text-base md:text-lg">
          立即加入
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="icon w-5 h-5 md:w-5 md:h-5">
              <path d="M5 12h14" strokeWidth="2" />
              <path d="M12 5l7 7-7 7" strokeWidth="2" />
          </svg>
        </button>
      </div>
      
      {/* Lottie 動畫 */}
      <LottieHero
        className="lottie-animation"
        desktopSrc="/assets/landing-page/key-vision-desktop.json"
        mobileSrc="/assets/landing-page/key-vision-mobile.json"
        breakpoint={768}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}

