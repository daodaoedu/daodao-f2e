import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MARATHON_LINKS, NAV_LINK, USER_LINK } from '@/constants/category';
import type { MenuItem } from '@/constants/category';
import { getManageSidebarItems } from '@/constants/sidebar';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import { cn } from '@/utils/cn';
import Collapse from '../Collapse';
import Button from '../Button';

interface OnCloseProps {
  onClose: () => void;
}

function ExploreMenu({ onClose }: OnCloseProps) {
  return (
    <div>
      <nav>
        <ul className="pt-2">
          {NAV_LINK.map(({ link, name, target }: MenuItem) => (
            <li key={name}>
              <Link
                href={link}
                target={target}
                className="block px-4 py-2 text-basic-400"
                onClick={onClose}
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Collapse as="nav">
        <Collapse.Toggle
          className="py-2 px-4 flex items-center rounded-lg text-primary-base w-full"
          withIcon
        >
          島島盃-春季學習馬拉松
        </Collapse.Toggle>
        <Collapse.List className="w-full">
          {MARATHON_LINKS.map(({ name, link, disabled }) => (
            <Collapse.Item key={name} className="*:px-10 *:leading-10">
              {disabled ? (
                <div className="text-basic-300 cursor-not-allowed">{name}</div>
              ) : (
                <Link
                  href={link}
                  className="block text-basic-400"
                  onClick={onClose}
                >
                  {name}
                </Link>
              )}
            </Collapse.Item>
          ))}
        </Collapse.List>
      </Collapse>
    </div>
  );
}

function ProfileMenu({ onClose }: OnCloseProps) {
  const auth = useAuth();

  const sidebarItems = useMemo(
    () => getManageSidebarItems({ role: auth.user?.role }),
    [auth.user?.role]
  );

  return (
    auth.isLoggedIn && (
      <nav>
        <ul className="pt-2">
          {sidebarItems.map((item) =>
            item.children ? null : (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-basic-400"
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              </li>
            )
          )}

          {USER_LINK.map(({ name, id }) => (
            <li key={name}>
              <Link
                href={`/profile?id=${id}`}
                className="block px-4 py-2 text-basic-400"
                onClick={onClose}
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    )
  );
}

enum NavType {
  Explore = 'explore',
  Profile = 'profile',
}

function MobileMenu() {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const auth = useAuth();
  const authDispatch = useAuthDispatch();
  const [navType, setNavType] = useState<NavType>(NavType.Explore);

  const navList = [
    {
      name: '探索',
      type: NavType.Explore,
    },
    {
      name: '關於我',
      type: NavType.Profile,
    },
  ];

  useEffect(() => {
    if (isOpenMenu) {
      document.body.classList.add('overflow-y-hidden');
    } else {
      document.body.classList.remove('overflow-y-hidden');
    }
  }, [isOpenMenu]);

  return (
    <>
      <button
        type="button"
        title="menu"
        className="text-transparent flex flex-col items-center justify-center gap-1.5 size-14 overflow-hidden"
        onClick={() => setIsOpenMenu(!isOpenMenu)}
      >
        <div
          className={cn(
            'w-6 h-0.5 bg-basic-white transition-transform origin-top-right pointer-events-none',
            isOpenMenu ? '-rotate-45' : 'rotate-0'
          )}
        />
        <div
          className={cn(
            'w-6 h-0.5 bg-basic-white transition-[transform,opacity] origin-left pointer-events-none',
            isOpenMenu
              ? 'translate-x-full opacity-0'
              : 'translate-x-0 opacity-100'
          )}
        />
        <div
          className={cn(
            'w-6 h-0.5 bg-basic-white transition-transform origin-bottom-right pointer-events-none',
            isOpenMenu ? 'rotate-45' : 'rotate-0'
          )}
        />
      </button>
      <div
        className={cn(
          'absolute top-full inset-x-0 flex flex-col body-md',
          'bg-basic-white transition-[min-height] overflow-auto h-0',
          'data-[is-open=true]:min-h-screen-without-padding-top data-[is-open=false]:min-h-0'
        )}
        data-is-open={isOpenMenu}
      >
        {auth.isLoggedIn && (
          <div
            className={cn(
              'relative flex mx-4 pt-1',
              'after:content-[""] after:absolute after:bottom-0 after:left-0',
              'after:w-full after:h-0.5 after:bg-basic-200 after:rounded-full'
            )}
          >
            {navList.map((navItem) => (
              <Button
                key={navItem.type}
                className={cn(
                  'relative flex-1 flex items-center justify-center gap-1.5 py-2',
                  'after:content-[""] after:absolute after:bottom-0 after:left-0',
                  'after:w-full after:h-0.5 after:bg-basic-200 after:rounded-full after:z-10',
                  navItem.type === navType && 'after:bg-primary-base'
                )}
                onClick={() => setNavType(navItem.type)}
              >
                {navItem.type === NavType.Profile && (
                  <img
                    src={auth.user.photoURL}
                    alt={auth.user.name}
                    width="20"
                    height="20"
                    className="rounded-full"
                  />
                )}
                {navItem.name}
              </Button>
            ))}
          </div>
        )}
        <div className="flex-1 flex flex-col pb-20">
          {navType === NavType.Explore && (
            <ExploreMenu onClose={() => setIsOpenMenu(false)} />
          )}
          {navType === NavType.Profile && (
            <ProfileMenu onClose={() => setIsOpenMenu(false)} />
          )}
          <div
            className={cn(
              'fixed bottom-0 left-0 right-0 flex bg-basic-white',
              'transition-opacity opacity-0 pointer-events-none',
              isOpenMenu && 'opacity-100 pointer-events-auto'
            )}
          >
            {auth.isLoggedIn ? (
              <Button
                className="flex-1 px-4 pb-6 text-left"
                onClick={() => {
                  authDispatch.logout();
                  setIsOpenMenu(false);
                }}
              >
                登出
              </Button>
            ) : (
              <Button
                variant="outline"
                color="primary"
                className="flex-1 m-4"
                onClick={() => {
                  authDispatch.openLoginModal();
                  setIsOpenMenu(false);
                }}
              >
                登入
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileMenu;
