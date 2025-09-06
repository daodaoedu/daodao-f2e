'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

interface MobileMenuProps {
  className?: string;
}

// 自定義 hook 來檢測手機寬度
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // 初始化檢查
    checkIsMobile();

    // 監聽視窗大小變化
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}

export function MobileMenu({ className }: MobileMenuProps) {
  const { scrollToElement } = useSmoothScroll();
  const isVisible = useScrollVisibility({ threshold: 250 }); // 捲動超過 250px 時顯示
  const isMobile = useIsMobile(); // 手機寬度：<= 768px
  const [activeSection, setActiveSection] = useState<string>('');

  const menuItems = [
    { label: '解決困境', targetId: 'feature' },
    { label: '功能生態', targetId: 'functions' },
    { label: '方案', targetId: 'plans' },
  ];

  // 監聽滾動位置，判斷當前在哪個錨點區域
  useEffect(() => {
    const handleScroll = () => {
      const sections = menuItems.map(item => item.targetId);
      const scrollPosition = window.scrollY + 100; // 添加偏移量

      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始化檢查

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [menuItems]);

  const handleMenuClick = (targetId: string) => {
    // 為移動端導航添加適當的偏移量
    const mobileNavHeight = 60;
    scrollToElement(targetId, mobileNavHeight);
  };

  // 在手機寬度時永遠顯示，在平板寬度以上時隱藏
  if (!isMobile) return null;
  
  // 在手機寬度時，需要捲動到指定深度才顯示
  if (!isVisible) return null;

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 z-40 bg-mascot-aqua border-t border-gray-200 animate-in slide-in-from-bottom-4 duration-300 h-[60px]', className)}>
      <div className="flex justify-around items-center h-full">
        {menuItems.map((item) => {
          const isActive = activeSection === item.targetId;
          return (
            <button
              key={item.targetId}
              type="button"
              onClick={() => handleMenuClick(item.targetId)}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 px-3 py-2 text-base transition-all duration-200 border-none cursor-pointer h-full w-full ',
                isActive 
                  ? 'bg-white text-primary-darker' 
                  : 'text-primary-darker hover:bg-white hover:text-primary-darker bg-transparent'
              )}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
