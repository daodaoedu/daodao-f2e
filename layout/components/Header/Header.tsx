'use client';

import { useEffect, useRef } from 'react';
import { CustomLink } from '@/shared/ui/custom-link';
import newLogo from '@/public/assets/brand/horizontal-secondary-logo.png';
import { PromotionBar, usePromotion } from '@/contexts/Promotion';
import { cn } from '@/shared/lib/cn';
import { Image } from '@/shared/ui/image';
import MobileMenu from './MobileMenu';
import DesktopMenu from './DesktopMenu';

function Header() {
  const { isShowShadow, isShowPromotionBar, setHeight } = usePromotion();
  const prevShowPromotionBar = useRef<boolean | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScrollPaddingTop = () => {
      requestAnimationFrame(() => {
        if (!headerRef.current) return;
        const headerOffset = headerRef.current.offsetHeight;
        const root = document.querySelector(':root');

        setHeight(Math.floor(headerOffset));
        if (root instanceof HTMLElement) {
          root.style.setProperty(
            'scroll-padding-top',
            `${headerOffset + 80}px`
          );
        }
      });
    };

    if (prevShowPromotionBar.current !== isShowPromotionBar) {
      handleScrollPaddingTop();
      prevShowPromotionBar.current = isShowPromotionBar;
    }

    window.addEventListener('resize', handleScrollPaddingTop);
    return () => {
      window.removeEventListener('resize', handleScrollPaddingTop);
    };
  }, [headerRef.current, isShowPromotionBar]);

  return (
    <div
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-30',
        isShowShadow && 'shadow-md shadow-basic-black/25'
      )}
    >
      <PromotionBar />
      <header className="body-md relative flex w-full items-center justify-between bg-primary-base px-4">
        <div className="flex-1">
          <CustomLink href="/" className="block py-6">
            <Image
              src={newLogo}
              alt="島島阿學"
              width={152}
              height={22}
              priority
            />
          </CustomLink>
        </div>
        <div className="hidden flex-[2] items-center justify-between lg:flex">
          <DesktopMenu />
        </div>
        <div className="lg:hidden">
          <MobileMenu />
        </div>
      </header>
    </div>
  );
}

export default Header;
