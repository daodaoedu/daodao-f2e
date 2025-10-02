'use client';

import Link from 'next/link';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { NAV_ITEMS } from '../model';

export const MobileNavbar = () => {
  const isVisible = useScrollVisibility({ threshold: 250 });
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const headings = NAV_ITEMS.map((item) => document.getElementById(item.id));
    const sections = headings.filter((heading) => heading !== null);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry?.target?.id);
        }
      });
    });

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 block h-[60px] translate-y-full border-t border-gray-200 bg-mascot-aqua transition-[transform,opacity] duration-300 ease-in-out md:hidden',
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-full opacity-0'
      )}
    >
      <ul className="flex h-full items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                'flex h-full w-full flex-col items-center justify-center space-y-1 rounded-none px-3 py-2 text-base',
                isActive
                  ? 'bg-white text-primary-darker hover:bg-white'
                  : 'bg-transparent text-primary-darker hover:bg-white hover:text-primary-darker'
              )}
              asChild
            >
              <Link href={`/#${item.id}`}>{item.label}</Link>
            </Button>
          );
        })}
      </ul>
    </nav>
  );
};
