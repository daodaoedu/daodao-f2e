'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import useMediaQuery from '@/hooks/useMediaQuery';
import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  className?: string;
}

const menuItems = [
  { label: '解決困境', targetId: 'feature' },
  { label: '功能生態', targetId: 'functions' },
  { label: '方案', targetId: 'plans' },
];

export function MobileMenu({ className }: MobileMenuProps) {
  const { scrollToElement } = useSmoothScroll();
  const isVisible = useScrollVisibility({ threshold: 250 }); // 捲動超過 250px 時顯示
  const isMobile = !useMediaQuery('isMedium'); // 手機寬度：< 768px
  const [activeSection, setActiveSection] = useState<string>('');


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
  }, []);

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
            <Button
              key={item.targetId}
              type="button"
              onClick={() => handleMenuClick(item.targetId)}
              variant="ghost"
              className={cn(
                'flex flex-col items-center justify-center space-y-1 px-3 py-2 text-base h-full w-full rounded-none',
                isActive 
                  ? 'bg-white text-primary-darker hover:bg-white' 
                  : 'text-primary-darker hover:bg-white hover:text-primary-darker bg-transparent'
              )}
            >
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
