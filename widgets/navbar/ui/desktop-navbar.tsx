'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { AuthButton } from '@/contexts/Auth';
import { cn } from '@/utils/cn';
import { NAV_ITEMS } from '../model';

interface DesktopNavbarProps {
  alwaysShow?: boolean;
}

export const DesktopNavbar = ({ alwaysShow = false }: DesktopNavbarProps) => {
  const isVisible = useScrollVisibility({ threshold: 200 });
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(':root');
    const navHeight = navRef.current?.offsetHeight ?? 0;

    root?.style.setProperty('scroll-padding-top', `${navHeight + 16}px`);

    return () => {
      root?.style.removeProperty('scroll-padding-top');
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className={cn(
        'fixed left-0 right-0 top-0 z-20 hidden items-center justify-between border-b border-white/20 px-8 py-4 backdrop-blur-[10px] transition-[transform,opacity] duration-300 ease-in-out md:flex',
        alwaysShow && 'flex',
        alwaysShow || isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-full opacity-0'
      )}
    >
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="cursor-pointer border-none bg-none p-0 transition-transform duration-200 ease-in-out"
          asChild
        >
          <Link href="/">
            <Image
              src="/assets/landing-page/logo-simple.svg"
              alt="回到首頁"
              width={142}
              height={24}
            />
          </Link>
        </Button>
      </div>
      <ul className="flex items-center gap-8">
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className="hidden md:block">
            <Button
              variant="ghost"
              className="relative cursor-pointer border-none bg-none p-0 text-base font-medium text-primary-darker transition-all duration-300 ease-in-out after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary-base after:transition-all after:duration-300 after:ease-in-out after:content-[''] hover:text-primary-base hover:after:w-full"
              animation="none"
              asChild
            >
              <Link href={`/#${item.id}`}>{item.label}</Link>
            </Button>
          </li>
        ))}
        <li>
          <AuthButton variant="ctaOrangeSmall">立即加入</AuthButton>
        </li>
      </ul>
    </nav>
  );
};
