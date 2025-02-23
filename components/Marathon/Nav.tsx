import Link from 'next/link';
import React from 'react';
import { usePromotion } from '@/contexts/Promotion';
import { MARATHON_LINKS } from '@/constants/category';
import { GoArrowUpRight } from 'react-icons/go';

import { cn } from '@/utils/cn';

const Nav = ({ activeTab }: { activeTab: string }) => {
  const { height } = usePromotion();

const navItems = MARATHON_LINKS.map((item) => ({
  ...item,
  active: item.name === activeTab,
  disabled: item.disabled ?? false,
  external: item.external ?? false,
}));

  return (
    <nav
      className={cn(
        'sticky z-10 bg-basic-100 text-nowrap overflow-x-auto shadow-md shadow-basic-black/10'
      )}
      style={{ top: `${height}px` }}
    >
      <ul className="max-w-[750px] mx-auto flex justify-between gap-4">
        {navItems.map(({ name, link, active, disabled, external }) => (
          <li key={name} className="shrink-0">
            {disabled ? (
              <span className="block p-4 text-nowrap text-basic-300 cursor-not-allowed body-sm font-medium">
                {name}
              </span>
            ) : (
              <Link
                href={link}
                target={external ? '_blank' : '_self'}
                rel={external ? 'noopener noreferrer' : ''}
                className={cn(
                  'relative p-4 flex items-center gap-1 text-primary-base body-sm font-medium text-nowrap',
                  active &&
                    'before:content-[""] before:absolute before:bottom-2.5 before:left-4 before:right-4 before:h-[2px] before:bg-primary-base'
                )}
              >
                {name}
                {external && <GoArrowUpRight className="size-4" />}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;
