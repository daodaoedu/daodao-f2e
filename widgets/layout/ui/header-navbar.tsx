'use client';

import { CustomLink } from '@/shared/ui/custom-link';
import { useScrollVisibility } from '@/shared/lib/use-scroll-visibility';
import { Image } from '@/shared/ui/image';
import { Button } from '@/shared/ui/button';
import { AuthGuardButton } from '@/features/auth';
import { cn } from '@/shared/lib/cn';
import { useTranslation } from '@/shared/lib/translation';
import { useSession, useSessionActions } from '@/entities/session';
import Dropdown from '@/shared/components/Dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { NavItemType } from '../model';

interface HeaderNavbarProps {
  navItems: NavItemType[];
  alwaysShow?: boolean;
}

export const HeaderNavbar = ({
  navItems,
  alwaysShow = false,
}: HeaderNavbarProps) => {
  const { user } = useSession();
  const { logout } = useSessionActions();
  const isVisible = useScrollVisibility({ threshold: 200 });
  const { t } = useTranslation();

  const filteredNavItems = navItems.filter((item) => {
    const visibility = item.visibility ?? 'all';

    if (typeof visibility === 'function') {
      return visibility(user);
    }

    switch (visibility) {
      case 'auth':
        return !!user;
      case 'guest':
        return !user;
      case 'all':
      default:
        return true;
    }
  });

  return (
    <nav
      className={cn(
        'fixed left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-white/20 px-8 py-4 backdrop-blur-[10px] transition-[transform,opacity] duration-300 ease-in-out',
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
          animation="none"
          asChild
        >
          <CustomLink href="/">
            <Image
              src="/assets/landing-page/logo-simple.svg"
              alt="回到首頁"
              width={142}
              height={24}
            />
          </CustomLink>
        </Button>
      </div>
      <ul className="flex items-center gap-8">
        {filteredNavItems.map((item) => (
          <li key={item.label} className="hidden md:block">
            <Button
              variant="ghost"
              className="relative cursor-pointer border-none bg-none p-0 text-base font-medium text-primary-darker transition-all duration-300 ease-in-out after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary-base after:transition-all after:duration-300 after:ease-in-out after:content-[''] hover:text-primary-base hover:after:w-full"
              animation="none"
              asChild
            >
              <CustomLink href={item.href}>{t(item.label)}</CustomLink>
            </Button>
          </li>
        ))}
        <li>
          {user ? (
            <div className="flex items-center gap-3.5">
              <Dropdown as="nav">
                <Dropdown.Toggle animation="none" className="p-0">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={user.photoURL ?? ''}
                      alt={user.name ?? 'user avatar'}
                    />
                    <AvatarFallback className="bg-primary-base text-xs font-semibold text-white">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Dropdown.Toggle>
                <Dropdown.List className="mt-2">
                  <Dropdown.Item className="text-nowrap rounded-lg hover:bg-primary-lightest">
                    <button
                      type="button"
                      className="block p-2 text-basic-400"
                      onClick={logout}
                    >
                      登出
                    </button>
                  </Dropdown.Item>
                </Dropdown.List>
              </Dropdown>
            </div>
          ) : (
            <AuthGuardButton variant="ctaOrangeSmall">立即加入</AuthGuardButton>
          )}
        </li>
      </ul>
    </nav>
  );
};
