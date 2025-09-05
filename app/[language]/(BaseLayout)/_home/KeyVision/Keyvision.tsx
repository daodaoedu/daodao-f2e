'use client';

import { Image } from '@/components/ui/image';
import LottieHero from './LottieHero';

export function KeyVision() {
  return (
    <div className=" h-[800px] relative">
       <Image
          src="/assets/landing-page/deco-comma.svg"
          alt="裝飾逗號"
          width={83}
          height={97}
          className="md:h-6 absolute top-10 left-10"
        // w-6: 寬度 1.5rem (24px)
        // h-6: 高度 1.5rem (24px)
        // md:w-6: 在中等螢幕以上時寬度 1.5rem (24px)
        // md:h-6: 在中等螢幕以上時高度 1.5rem (24px)
        />
      <div className="grid grid-cols-12 gap-4 md:gap-6 relative pt-24 md:pt-32">
        {/* 標題區塊 - 手機版佔12欄，平板以上佔6欄 */}
       
        <div className="col-span-12 md:col-span-6 flex flex-col justify-center items-center relative font-semibold text-center w-fit mx-auto" id="top">

          <Image
            src="/assets/landing-page/deco-flower-orange.svg"
            alt="裝飾橘花"
            width={44}
            height={39}
            className="absolute top-0 left-0"
          // w-6: 寬度 1.5rem (24px)
          // h-6: 高度 1.5rem (24px)
          // md:w-6: 在中等螢幕以上時寬度 1.5rem (24px)
          // md:h-6: 在中等螢幕以上時高度 1.5rem (24px)
          />
          <Image
            src="/assets/landing-page/deco-arrow.svg"
            alt="裝飾箭頭"
            width={93}
            height={75}
            className="absolute top-[-20px] right-[-50px]"
          />
          <Image
            src="/assets/landing-page/logo.svg"
            alt="島島阿學 Logo"
            width={200}
            height={44}
            className="mb-8"
          />
          <h2 className="text-2xl text-primary-darker">讓學習成為充滿<br /><span className="text-3xl text-primary-base">自我掌握、互助支持<br />和看得見進步的美好日常</span></h2>
          {/* text-2xl: 字體大小 1.5rem (24px) */}
          {/* text-3xl: 字體大小 1.875rem (30px) */}
          {/* text-primary-darker: 主要深色文字顏色 */}
          {/* text-primary-base: 主要基礎文字顏色 */}

          <button type="button" className="flex justify-center items-center rounded-[40px] border-2 border-[#FFA10B] bg-[#FFA10B] text-white px-5 h-12 w-36 md:h-14 md:w-45 font-semibold cursor-pointer transition-all duration-300 ease-in-out hover:bg-white hover:text-[#FFA10B] hover:-translate-y-0.5 hover:shadow-[0_12px_20px_0_rgba(255,161,11,0.3)] active:translate-y-0 shadow-[0_8px_10px_0_rgba(255,161,11,0.2)] text-base md:text-lg mt-8">
            {/* flex: 設定為 flexbox 佈局 */}
            {/* justify-center: 水平置中對齊 */}
            {/* items-center: 垂直置中對齊 */}
            {/* rounded-[40px]: 圓角 40px */}
            {/* border-2: 邊框寬度 2px */}
            {/* border-[#FFA10B]: 邊框顏色為橘色 #FFA10B */}
            {/* bg-[#FFA10B]: 背景顏色為橘色 #FFA10B */}
            {/* text-white: 文字顏色為白色 */}
            {/* px-5: 左右內邊距 1.25rem (20px) */}
            {/* h-12: 高度 3rem (48px) */}
            {/* w-36: 寬度 9rem (144px) */}
            {/* md:h-14: 在中等螢幕以上時高度 3.5rem (56px) */}
            {/* md:w-45: 在中等螢幕以上時寬度 11.25rem (180px) */}
            {/* font-semibold: 字體粗細為半粗體 */}
            {/* cursor-pointer: 滑鼠游標為手型 */}
            {/* transition-all: 所有屬性都有過渡效果 */}
            {/* duration-300: 過渡時間 300ms */}
            {/* ease-in-out: 過渡緩動函數為 ease-in-out */}
            {/* hover:bg-white: 滑鼠懸停時背景變為白色 */}
            {/* hover:text-[#FFA10B]: 滑鼠懸停時文字變為橘色 */}
            {/* hover:-translate-y-0.5: 滑鼠懸停時向上移動 0.125rem */}
            {/* hover:shadow-[0_12px_20px_0_rgba(255,161,11,0.3)]: 滑鼠懸停時陰影效果 */}
            {/* active:translate-y-0: 點擊時回到原位 */}
            {/* shadow-[0_8px_10px_0_rgba(255,161,11,0.2)]: 預設陰影效果 */}
            {/* text-base: 字體大小 1rem (16px) */}
            {/* md:text-lg: 在中等螢幕以上時字體大小 1.125rem (18px) */}
            立即加入
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="icon w-5 h-5 md:w-5 md:h-5">
              {/* icon: 自定義 CSS 類別，用於圖示樣式 */}
              {/* w-5: 寬度 1.25rem (20px) */}
              {/* h-5: 高度 1.25rem (20px) */}
              {/* md:w-5: 在中等螢幕以上時寬度 1.25rem (20px) */}
              {/* md:h-5: 在中等螢幕以上時高度 1.25rem (20px) */}
              <path d="M5 12h14" strokeWidth="2" />
              <path d="M12 5l7 7-7 7" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Lottie 動畫區塊 - 手機版佔12欄，平板以上佔6欄 */}
        <div className="col-span-12 md:col-span-6">
          <LottieHero
            className="lottie-animation"
            // lottie-animation: 自定義 CSS 類別，用於 Lottie 動畫樣式
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

