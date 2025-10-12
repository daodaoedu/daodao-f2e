'use client';

import { useScrollVisibility } from '@/shared/lib/use-scroll-visibility';
import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { cn } from '@/shared/lib/cn';
import { CustomLink } from '@/shared/ui/custom-link';

export const LandingPageFloatButtons = () => {
  const isVisible = useScrollVisibility({ threshold: 300 });

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={cn(
        'fixed bottom-20 right-6 z-50 hidden transition-opacity md:block',
        isVisible
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      )}
    >
      <div className="flex flex-col items-center space-y-2">
        <Button
          type="button"
          onClick={handleScrollToTop}
          variant="ctaPrimary"
          size="icon"
          className="size-12 shadow-none"
          aria-label="回到頂端"
        >
          <Icon name="arrow-up" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-[90px] bg-transparent p-0 hover:bg-transparent"
          aria-label="點擊進入心理測驗"
          asChild
        >
          <CustomLink href="/#personality-test">
            <Image
              src="/assets/landing-page/badge.svg"
              alt="點擊進入心理測驗"
              width={90}
              height={90}
              className="animate-spin-slow object-contain"
            />
          </CustomLink>
        </Button>
      </div>
    </div>
  );
};
