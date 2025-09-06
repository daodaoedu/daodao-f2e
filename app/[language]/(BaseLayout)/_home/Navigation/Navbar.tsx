'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import useMediaQuery from '@/hooks/useMediaQuery';
import { Image } from '@/components/ui/image';

export default function Navbar() {
  const { scrollToElement, scrollToTop } = useSmoothScroll();
  const isTabletAndUp = useMediaQuery('isMedium');
  const isVisible = useScrollVisibility({ threshold: 200 }); // 捲動超過 200px 時顯示

  const handleNavClick = (targetId: string) => {
    // 為導航欄添加適當的偏移量，避免被固定導航欄遮擋
    const navbarHeight = 80; // 根據實際導航欄高度調整
    scrollToElement(targetId, navbarHeight);
  };

  const handleLogoClick = () => {
    scrollToTop();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000]  backdrop-blur-[10px] px-8 py-4 flex justify-between items-center transition-all duration-300 ease-in-out border-b border-white/20 ${
      isTabletAndUp 
        ? 'opacity-100 translate-y-0 pointer-events-auto' 
        : isVisible 
        ? 'opacity-100 translate-y-0 pointer-events-auto' 
        : 'opacity-0 -translate-y-full pointer-events-none'
    }`}>
      <div className="flex items-center">
        <button 
          type="button"
          onClick={handleLogoClick}
          className="bg-none border-none p-0 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105"
          aria-label="回到首頁"
        >
          <Image src="/assets/landing-page/logo-simple.svg" alt="回到首頁" width={142} height={24} />
        </button>
      </div>
      <div className="flex items-center gap-8">
        <div className="hidden md:block">
          <button 
            type="button"
            onClick={() => handleNavClick('feature')} 
            className="text-primary-darker bg-none border-none p-0 font-medium text-base cursor-pointer transition-all duration-300 ease-in-out hover:text-primary-base hover:-translate-y-0.5 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-primary-base after:transition-all after:duration-300 after:ease-in-out hover:after:w-full"
          >
            解決困境
          </button>
        </div>
        <div className="hidden md:block">
          <button 
            type="button"
            onClick={() => handleNavClick('functions')} 
            className="text-primary-darker bg-none border-none p-0 font-medium text-base cursor-pointer transition-all duration-300 ease-in-out hover:text-primary-base hover:-translate-y-0.5 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-primary-base after:transition-all after:duration-300 after:ease-in-out hover:after:w-full"
          >
            功能生態
          </button>
        </div>
        <div className="hidden md:block">
          <button 
            type="button"
            onClick={() => handleNavClick('plans')} 
            className="text-primary-darker bg-none border-none p-0 font-medium text-base cursor-pointer transition-all duration-300 ease-in-out hover:text-primary-base hover:-translate-y-0.5 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-primary-base after:transition-all after:duration-300 after:ease-in-out hover:after:w-full"
          >
            方案
          </button>
        </div>
        <button 
          type="button" 
          className="bg-tips text-white px-6 py-2 rounded-full font-medium text-sm border-2 border-tips hover:!bg-white hover:!text-tips hover:!border-tips transition-colors duration-200"
        >
          立即加入
        </button>
      </div>
    </nav>
  );
}

