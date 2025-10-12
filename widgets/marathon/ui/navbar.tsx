'use client';

import { CustomLink } from '@/shared/ui/custom-link';
import { usePathname } from 'next/navigation';
import { MARATHON_LINKS } from '@/constants/category';
import useShadowToggleOnScroll from '@/shared/lib/use-shadow-toggle-on-scroll';
import { cn } from '@/shared/lib/cn';

export const Navbar = () => {
  const pathname = usePathname();
  const announcementsPath = 'announcements';

  const navItems = MARATHON_LINKS.map((item, index) => ({
    label: item.name,
    href: item.link,
    active: pathname?.includes(announcementsPath)
      ? item.link.includes(announcementsPath)
      : index === 0,
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
            <CustomLink
              href={item.href}
              className={cn(
                'body-sm relative flex items-center gap-1 text-nowrap p-4 font-medium text-primary-base',
                item.active &&
                  'before:absolute before:bottom-2.5 before:left-4 before:right-4 before:h-[2px] before:bg-primary-base before:content-[""]'
              )}
            >
              {item.label}
            </CustomLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
