'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import Image from 'next/image';
import { ChevronUp } from 'lucide-react';

interface FloatButtonsProps {
  className?: string;
}

export function FloatButtons({ className }: FloatButtonsProps) {
  const { scrollToTop, scrollToElement } = useSmoothScroll();
  const isVisible = useScrollVisibility({ threshold: 300 }); // 捲動超過 300px 時顯示

  const handleScrollToTop = () => {
    scrollToTop();
  };

  const handleScrollToPersonalityTest = () => {
    scrollToElement('personality-test', 100); // 添加適當的偏移量
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className || ''}`}>
      <div className="flex flex-col items-center space-y-2">
        {/* 回到頂端按鈕 */}
        <button
          type="button"
          onClick={handleScrollToTop}
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center group"
          aria-label="回到頂端"
        >
          <ChevronUp className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" />
        </button>
        
        {/* 心理測驗徽章按鈕 */}
        <button
          type="button"
          onClick={handleScrollToPersonalityTest}
          className="flex items-center justify-center group"
          aria-label="點擊進入心理測驗"
        >
          <Image 
            src="/assets/landing-page/badge.svg" 
            alt="點擊進入心理測驗"
            width={90}
            height={90}
            className="w-full h-full object-contain rotate"
          />
        </button>
      </div>
    </div>
  );
}
