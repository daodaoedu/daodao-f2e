'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';
import Link from 'next/link';

export const FloatButtons = () => {
  const { scrollToTop } = useSmoothScroll();
  const isVisible = useScrollVisibility({ threshold: 300 });

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
          onClick={scrollToTop}
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
          <Link href="/#personality-test">
            <Image
              src="/assets/landing-page/badge.svg"
              alt="點擊進入心理測驗"
              width={90}
              height={90}
              className="animate-spin-slow object-contain"
            />
          </Link>
        </Button>
      </div>
    </div>
  );
};
