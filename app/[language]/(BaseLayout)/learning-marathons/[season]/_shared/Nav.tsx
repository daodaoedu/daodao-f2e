'use client';

import Link from 'next/link';
import { MARATHON_LINKS } from '@/constants/category';
import useShadowToggleOnScroll from '@/hooks/useShadowToggleOnScroll';
import { cn } from '@/utils/cn';

export default function Nav() {
  const navItems = MARATHON_LINKS.map((item) => ({
    label: item.name,
    href: item.link,
    active: item.name === '活動詳情',
  }));

  const { isShowShadow, height, TriggerElement } = useShadowToggleOnScroll();

  return (
    <nav
      className={cn(
        'sticky z-10 overflow-x-auto text-nowrap bg-basic-100 transition-shadow duration-300',
        isShowShadow && 'shadow-md shadow-basic-black/10'
      )}
      style={{ top: `${height}px` }}
    >
      <TriggerElement />
      <ul className="mx-auto flex max-w-[750px] justify-between gap-4">
        {navItems.map((item) => (
          <li key={item.label} className="shrink-0">
            <Link
              href={item.href}
              className={cn(
                'body-sm relative flex items-center gap-1 text-nowrap p-4 font-medium text-primary-base',
                item.active &&
                  'before:absolute before:bottom-2.5 before:left-4 before:right-4 before:h-[2px] before:bg-primary-base before:content-[""]'
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
