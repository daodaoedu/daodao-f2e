import Link from 'next/link';
import React from 'react';
import { usePromotion } from '@/contexts/Promotion';
import { MARATHON_LINKS } from '@/constants/category';
import { cn } from '@/utils/cn';

const Nav = ({ activeTab }: { activeTab: string }) => {
  const { height } = usePromotion();

  const navItems = MARATHON_LINKS.map((item) => ({
    ...item,
    active: item.name === activeTab,
  }));

  return (
    <nav
      className={cn(
        'sticky z-10 bg-basic-100 text-nowrap overflow-x-auto shadow-md shadow-basic-black/10'
      )}
      style={{ top: `${height}px` }}
    >
      <ul className="mx-auto flex max-w-[750px] justify-between gap-4">
        {navItems.map(({ name, link, active }) => (
          <li key={name} className="shrink-0">
            <Link
              href={link}
              className={cn(
                'relative p-4 flex items-center gap-1 text-primary-base body-sm font-medium text-nowrap',
                active &&
                  'before:content-[""] before:absolute before:bottom-2.5 before:left-4 before:right-4 before:h-[2px] before:bg-primary-base'
              )}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;
