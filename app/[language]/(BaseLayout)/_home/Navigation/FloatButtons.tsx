'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import useMediaQuery from '@/hooks/useMediaQuery';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon } from '@/components/ui/arrow-up-icon';

interface FloatButtonsProps {
  className?: string;
}

export function FloatButtons({ className }: FloatButtonsProps) {
  const { scrollToTop, scrollToElement } = useSmoothScroll();
  const isTabletAndUp = useMediaQuery('isMedium');
  const isVisible = useScrollVisibility({ threshold: 300 }); // 捲動超過 300px 時顯示

  const handleScrollToTop = () => {
    scrollToTop();
  };

  const handleScrollToPersonalityTest = () => {
    scrollToElement('personality-test', 100); // 添加適當的偏移量
  };

  // 平板以上始終顯示，手機版根據捲動狀態顯示
  if (!isTabletAndUp && !isVisible) return null;

  return (
    <div className={`fixed bottom-20 right-6 z-50 ${className || ''}`}>
      <div className="flex flex-col items-center space-y-2">
        {/* 回到頂端按鈕 */}
        <Button
          type="button"
          onClick={handleScrollToTop}
          variant="ctaPrimary"
          size="icon"
          className="w-12 h-12 shadow-none"
          aria-label="回到頂端"
        >
          <ArrowUpIcon />
        </Button>
        
        {/* 心理測驗徽章按鈕 */}
        <Button
          type="button"
          onClick={handleScrollToPersonalityTest}
          variant="ghost"
          size="icon"
          className="w-[90px] h-[90px] p-0 bg-transparent hover:bg-transparent"
          aria-label="點擊進入心理測驗"
        >
          <Image 
            src="/assets/landing-page/badge.svg" 
            alt="點擊進入心理測驗"
            width={90}
            height={90}
            className="w-full h-full object-contain animate-spin-slow"
          />
        </Button>
      </div>
    </div>
  );
}
