import Link from 'next/link';
import React from 'react';
import { usePromotion } from '@/contexts/Promotion';
import { GoArrowUpRight } from 'react-icons/go';

import { cn } from '@/utils/cn';

const Nav = ({ activeTab }: { activeTab: string }) => {
  const navItems = [
    { label: '活動詳情', href: '/learning-marathon' },
    { label: '活動公告', href: '/learning-marathon/announcements' },
    {
      label: '學習計畫分享區',
      href: '/marathon-sharing',
      disabled: true,
      external: true,
    },
    { label: '成果發表', href: '#', disabled: true },
  ].map((item) => ({ ...item, active: item.label === activeTab }));

  const { height } = usePromotion();

  return (
    <nav
      className={cn(
        'sticky z-10 bg-basic-100 text-nowrap overflow-x-auto shadow-md shadow-basic-black/10'
      )}
      style={{ top: `${height}px` }}
    >
      <ul className="max-w-[750px] mx-auto flex justify-between gap-4">
        {navItems.map((item) => (
          <li key={item.label} className="shrink-0">
            {item.disabled ? (
              <span className="block p-4 text-nowrap text-basic-300 cursor-not-allowed body-sm font-medium">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                target={item.external ? '_blank' : '_self'}
                rel={item.external ? 'noopener noreferrer' : ''}
                className={cn(
                  'relative p-4 flex items-center gap-1 text-primary-base body-sm font-medium text-nowrap',
                  item.active &&
                    'before:content-[""] before:absolute before:bottom-2.5 before:left-4 before:right-4 before:h-[2px] before:bg-primary-base'
                )}
              >
                {item.label}
                {item.external && <GoArrowUpRight className="size-4" />}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;
